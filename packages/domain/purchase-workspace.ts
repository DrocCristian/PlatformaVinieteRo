import {z} from 'zod';
import {validatePurchaseTechnical} from './purchase-validity.ts';
import {fleetCountries} from './fleet.ts';
import {validatePurchaseDraft,type PurchaseDraft,type PurchaseVehicle} from './purchase-preview.ts';
import {readTechnical} from './vehicle-profile.ts';
import {vinIdentitySchema} from './vehicle-identity.ts';
export type SavedPurchaseVehicle={id:string;companyId:string|null;plate:string;registration:string;label:string;vehicle:PurchaseVehicle;vin:string;legacyVin:boolean;technical:Record<string,string>;trailer:null|{id?:string;plate:string;country:string;vin:string;legacyVin:boolean;technical?:Record<string,string>};kind:string};
export function personalPurchaseVehicle(row:{id:string;plate:string;registration_country:string;label:string;technical:unknown}):SavedPurchaseVehicle{
 const t=readTechnical(row.technical),identity=vinIdentitySchema.parse(t?.identity??{});
 const vehicle:PurchaseVehicle=!t?'other':t.kind==='car'&&t.f1!==null&&t.f1<=3500?'car':t.kind==='goods'&&t.f1!==null?(t.f1<=3500?'van':'heavy'):'other';
 return {id:row.id,companyId:null,plate:row.plate,registration:row.registration_country,label:row.label,vehicle,...identity,kind:t?.kind??'unknown',technical:Object.fromEntries(Object.entries({category:t?.category,f1:t?.f1,f2:t?.f2,axles:t?.axles,seats:t?.seats,euro:t?.euro,co2:t?.co2Class,frontHeightMm:t?.frontHeightMm}).map(([k,v])=>[k,v==null?'':String(v)])),trailer:t?.trailer?{plate:t.trailer.plate,country:t.trailer.country,technical:Object.fromEntries(Object.entries({category:t.trailer.category,f1:t.trailer.f1,f2:t.trailer.f2,axles:t.trailer.axles}).map(([k,v])=>[k,v==null?'':String(v)])),...vinIdentitySchema.parse(t.trailer.identity??{})}:null};
}
export function fleetPurchaseVehicle(row:{id:string;company_id:string;plate:string;registration_country:string;label:string;kind:string;identity?:unknown;f1:number|null;f2:number|null;f3:number|null;axles:number|null;euro:string;co2_class:number|null}):SavedPurchaseVehicle{
 const identity=vinIdentitySchema.safeParse(row.identity??{});
 const vehicle:PurchaseVehicle=['truck','tractor'].includes(row.kind)?'heavy':row.f1!==null&&row.f1<=3500&&['car','van'].includes(row.kind)?row.kind as 'car'|'van':'other';
 return {id:row.id,companyId:row.company_id,plate:row.plate,registration:row.registration_country,label:row.label,vehicle,...(identity.success?identity.data:{vin:'',legacyVin:false}),kind:row.kind,technical:Object.fromEntries(Object.entries({f1:row.f1,f2:row.f2,f3:row.f3,axles:row.axles,euro:row.euro,co2:row.co2_class}).map(([k,v])=>[k,v==null?'':String(v)])),trailer:null};
}
export const selectionSchema=z.object({country:z.enum(fleetCountries),duration:z.string().max(20),start:z.string().max(10),time:z.string().max(5),year:z.string().max(4)});
export const purchaseBasketSchema=z.object({
 companyId:z.uuid().nullable(),title:z.string().trim().min(2).max(100),
 entries:z.array(z.object({vehicleId:z.uuid(),trailerId:z.uuid().nullable(),selections:z.array(selectionSchema).min(1).max(9),route:z.object({from:z.string().trim().max(160),to:z.string().trim().max(160),via:z.string().trim().max(500)}),notify:z.boolean()})).min(1).max(100)
}).superRefine((v,ctx)=>{
 if(new Set(v.entries.map(e=>e.vehicleId)).size!==v.entries.length)ctx.addIssue({code:'custom',message:'Vehicul duplicat în comandă.'});
 const trailers=v.entries.flatMap(e=>e.trailerId?[e.trailerId]:[]);
 if(new Set(trailers).size!==trailers.length)ctx.addIssue({code:'custom',message:'O remorcă nu poate fi folosită simultan de două vehicule.'});
});
export type PurchaseBasket=z.infer<typeof purchaseBasketSchema>;
export type PreparedPurchase=PurchaseDraft&{route:{from:string;to:string;via:string};notify:boolean};
export function snapshotPurchaseBasket(input:unknown,assets:SavedPurchaseVehicle[],today:string){
 const basket=purchaseBasketSchema.parse(input);
 const entries=basket.entries.map(entry=>{
  const vehicle=assets.find(v=>v.id===entry.vehicleId&&v.companyId===basket.companyId);
  if(!vehicle||['trailer','semitrailer'].includes(vehicle.kind))throw Error('Vehiculul nu este disponibil în contul selectat.');
  const draft={...vehicle,selections:entry.selections};
  const errors=validatePurchaseDraft(draft,today);
  if(Object.keys(errors).length)throw Error(Object.values(errors)[0]);
  if(['heavy','other'].includes(vehicle.vehicle)&&(!entry.route.from||!entry.route.to))throw Error('Completează plecarea și destinația.');
  let trailer=vehicle.trailer;
  if(entry.trailerId){
   const found=assets.find(v=>v.id===entry.trailerId&&v.companyId===basket.companyId);
   if(!basket.companyId||!found||!['trailer','semitrailer'].includes(found.kind))throw Error('Remorca nu aparține firmei selectate.');
   if((found.kind==='semitrailer'&&vehicle.kind!=='tractor')||(found.kind==='trailer'&&vehicle.kind==='tractor'))throw Error('Configurația remorcii nu este compatibilă.');
   trailer={id:found.id,plate:found.plate,country:found.registration,vin:found.vin,legacyVin:found.legacyVin,technical:found.technical};
  }
  const technicalReview=validatePurchaseTechnical({...vehicle.technical,...Object.fromEntries(Object.entries(trailer?.technical??{}).map(([k,v])=>['trailer-'+k,v]))},vehicle.vehicle,!!trailer,entry.selections.map(s=>s.country));
  return {...entry,vehicle:{...vehicle,trailer},technicalReview,status:'draft' as const};
 });
 return {...basket,entries,version:1,status:'draft' as const,totalMinor:null,paymentEnabled:false};
}
