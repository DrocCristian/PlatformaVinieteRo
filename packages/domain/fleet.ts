import {z} from 'zod';
import {isCalendarDate} from './catalog.ts';

export const fleetCountries=['AT','HU','RO','BG','CZ','SK','SI','CH','MD'] as const;
export const companySchema=z.object({
 name:z.string().trim().min(2).max(160),
 tax_id:z.string().trim().min(2).max(40),
 country:z.string().regex(/^[A-Z]{2}$/),
 billing_address:z.string().trim().min(5).max(500),
 billing_email:z.email().max(254)
});
export const assetKinds={car:'Autoturism',van:'Autoutilitară',truck:'Camion',tractor:'Cap tractor',trailer:'Remorcă',semitrailer:'Semiremorcă'} as const;
const mass=z.number().int().min(1).max(200000).nullable();
export const fleetAssetSchema=z.object({
 plate:z.string().trim().toUpperCase().transform(v=>v.replace(/[\s-]+/g,'')).pipe(z.string().regex(/^[A-Z0-9]{2,12}$/)),
 registration_country:z.string().regex(/^[A-Z]{2}$/),
 label:z.string().trim().max(80),
 kind:z.enum(['car','van','truck','tractor','trailer','semitrailer']),
 f1:mass,f2:mass,f3:mass,
 axles:z.number().int().min(1).max(12).nullable(),
 euro:z.enum(['unknown','0','1','2','3','4','5','6','electric']),
 co2_class:z.number().int().min(1).max(5).nullable()
}).superRefine((v,ctx)=>{
 if(v.f1&&v.f2&&v.f2>v.f1)ctx.addIssue({code:'custom',message:'F.2 nu poate depăși F.1.'});
 if(v.f3&&v.f2&&v.f3<v.f2)ctx.addIssue({code:'custom',message:'Verifică masa maximă a ansamblului F.3.'});
 if(!['trailer','semitrailer'].includes(v.kind)&&v.axles===1)ctx.addIssue({code:'custom',message:'Vehiculul motor trebuie să aibă cel puțin două axe.'});
});
export type FleetAsset=z.infer<typeof fleetAssetSchema>&{id:string;company_id:string};
export function isTowed(kind:string){return kind==='trailer'||kind==='semitrailer';}
const date=z.string().refine(isCalendarDate,'Data nu este validă.');
export const batchSchema=z.object({
 company_id:z.uuid(),title:z.string().trim().min(2).max(100),
 start:date,end:date,
 countries:z.array(z.enum(fleetCountries)).min(1).max(9).refine(v=>new Set(v).size===v.length),
 vehicles:z.array(z.object({vehicle_id:z.uuid(),trailer_id:z.uuid().nullable()})).min(1).max(100)
}).superRefine((v,ctx)=>{
 if(v.end<v.start)ctx.addIssue({code:'custom',message:'Sfârșitul perioadei trebuie să fie după început.'});
 const ids=v.vehicles.map(x=>x.vehicle_id);
 if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Vehicul duplicat în comandă.'});
 const trailers=v.vehicles.flatMap(x=>x.trailer_id?[x.trailer_id]:[]);
 if(new Set(trailers).size!==trailers.length)ctx.addIssue({code:'custom',message:'O remorcă nu poate fi alocată simultan la două vehicule.'});
});
export function snapshotBatch(input:unknown,assets:FleetAsset[]){
 const batch=batchSchema.parse(input);
 const find=(id:string)=>assets.find(a=>a.id===id&&a.company_id===batch.company_id);
 const vehicles=batch.vehicles.map(row=>{
  const vehicle=find(row.vehicle_id),trailer=row.trailer_id?find(row.trailer_id):null;
  if(!vehicle||isTowed(vehicle.kind))throw Error('Selectează un vehicul motor din această firmă.');
  if(row.trailer_id&&(!trailer||!isTowed(trailer.kind)))throw Error('Remorca nu aparține flotei selectate.');
  if(trailer?.kind==='semitrailer'&&vehicle.kind!=='tractor')throw Error('Selectează un cap tractor pentru semiremorcă.');
  if(vehicle.kind==='tractor'&&trailer?.kind==='trailer')throw Error('Pentru cap tractor selectează o semiremorcă.');
  return {vehicle:{...vehicle},trailer:trailer?{...trailer}:null};
 });
 // No automatic addition of F.1/F.2: semitrailer coupling load can otherwise be double-counted.
 return {...batch,vehicles,payment_mode:'immediate' as const,status:'draft' as const};
}
export type LedgerLine={
 id:string;companyId:string;vehicleId:string;plate:string;date:string;
 country:string;description:string;currency:string;grossMinor:number;invoiceReference:string|null;
};
export const reportSchema=z.object({
 companyId:z.uuid(),from:date,to:date,
 vehicleIds:z.array(z.uuid()).max(100),
 groupBy:z.enum(['fleet','vehicle'])
}).refine(v=>v.to>=v.from,'Interval invalid.');
export function buildReport(lines:LedgerLine[],input:unknown){
 const filter=reportSchema.parse(input);
 const selected=lines.filter(l=>l.companyId===filter.companyId&&l.date>=filter.from&&l.date<=filter.to&&(!filter.vehicleIds.length||filter.vehicleIds.includes(l.vehicleId)));
 const seen=new Set<string>();
 const groups=new Map<string,{label:string;currency:string;grossMinor:number;count:number}>();
 for(const line of selected){
  if(seen.has(line.id))throw Error('Poziție duplicată în registru.');seen.add(line.id);
  if(!isCalendarDate(line.date)||!Number.isSafeInteger(line.grossMinor)||!/^[A-Z]{3}$/.test(line.currency))throw Error('Poziție financiară invalidă.');
  const key=JSON.stringify([filter.groupBy==='vehicle'?line.vehicleId:'fleet',line.currency]);
  const group=groups.get(key)??{label:filter.groupBy==='vehicle'?line.plate:'Întreaga flotă',currency:line.currency,grossMinor:0,count:0};
  group.grossMinor+=line.grossMinor;group.count++;
  if(!Number.isSafeInteger(group.grossMinor))throw Error('Total prea mare.');
  groups.set(key,group);
 }
 return {kind:'statement' as const,fiscalInvoice:false,filter,lines:selected,groups:[...groups.values()]};
}
export function reportCsv(report:ReturnType<typeof buildReport>){
 const cell=(v:string|number)=>{let s=String(v);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const rows=[['Data','Țară','Număr înmatriculare','Descriere','Monedă','Sumă','Factură'],
 ...report.lines.map(l=>[l.date,l.country,l.plate,l.description,l.currency,(l.grossMinor/100).toFixed(2),l.invoiceReference??''])];
 return '\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
// A plan, not an invoice issuer. Supplier legal roles must be established before this is called.
export type BillableLine={id:string;companyId:string;issuerId:string;currency:string;invoiceId:string|null;model:'reseller'|'agent'|'unknown';taxReviewed:boolean};
export function planInvoices(lines:BillableLine[]){
 if(!lines.length)throw Error('Comanda este goală.');
 if(new Set(lines.map(l=>l.companyId)).size!==1)throw Error('O comandă trebuie să aibă un singur cumpărător.');
 if(new Set(lines.map(l=>l.id)).size!==lines.length)throw Error('Poziții duplicate.');
 if(lines.some(l=>l.invoiceId))throw Error('O poziție facturată nu poate fi facturată din nou.');
 if(lines.some(l=>l.model==='unknown'||!l.taxReviewed||!l.issuerId||!/^[A-Z]{3}$/.test(l.currency)))throw Error('Modelul fiscal și emitentul trebuie confirmate.');
 const groups=new Map<string,BillableLine[]>();
 for(const l of lines){const key=JSON.stringify([l.companyId,l.issuerId,l.currency]);groups.set(key,[...(groups.get(key)??[]),l]);}
 return [...groups.values()].map(rows=>({issuerId:rows[0].issuerId,currency:rows[0].currency,lineIds:rows.map(x=>x.id)}));
}
