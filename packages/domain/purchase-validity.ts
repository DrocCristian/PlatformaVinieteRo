import {isCalendarDate} from './catalog.ts';
import {availableDurations, type PurchaseVehicle, type Selection} from './purchase-preview.ts';

// Calendar previews only: never an issuance certificate or a supplier quotation.
export const countryZones={AT:'Europe/Vienna',HU:'Europe/Budapest',RO:'Europe/Bucharest',BG:'Europe/Sofia',CZ:'Europe/Prague',SK:'Europe/Bratislava',SI:'Europe/Ljubljana',CH:'Europe/Zurich',MD:'Europe/Chisinau'} as const;
export function addDays(day:string,n:number){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function addMonths(day:string,n:number){const [y,m,d]=day.split('-').map(Number);const target=new Date(Date.UTC(y,m-1+n,1,12));const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(d,last));return target.toISOString().slice(0,10);}
export function previewValidity(s:Selection,vehicle:PurchaseVehicle){
 const option=availableDurations(s.country,vehicle).find(o=>o.id===s.duration);
 if(!option||!isCalendarDate(s.start))return null;
 const start=s.start;let end:string|null=null;
 if(option.annual&&/^\d{4}$/.test(s.year)){
  const year=Number(s.year);const first=s.country==='HU'?`${year}-01-01`:`${year-1}-12-01`;
  end=`${year+1}-01-31`;
  if(start<first||start>end)return null;
 }else if(s.country==='BG'){
  // Clock changes and monthly boundary semantics require the supplier's exact instants.
  if(s.duration==='d7')end=addDays(start,6);
  if(s.duration==='weekend'){
   const dow=new Date(start+'T12:00:00Z').getUTCDay();
   if(![0,5,6].includes(dow))return null;
   end=addDays(start,dow===0?0:7-dow);
  }
 }else if(/^d\d+$/.test(s.duration))end=addDays(start,Number(s.duration.slice(1))-1);
 else if(s.duration==='m2'&&s.country==='AT')end=addMonths(start,2);
 else if(s.duration==='m1'&&['HU','SI'].includes(s.country))end=addMonths(start,1);
 else if(s.duration==='year'&&s.country==='SI')end=addMonths(start,12);
 else if(s.duration==='year'&&s.country==='CZ')end=addDays(addMonths(start,12),-1);
 // RO month periods and BG clock/month boundaries remain supplier-confirmed.
 return {start,end,zone:countryZones[s.country],activationReview:s.country==='AT'&&['m2','annual'].includes(s.duration),supplierConfirmation:true as const};
}

export type PurchaseTechnical=Record<string,string>;
export function requiredPurchaseFields(vehicle:PurchaseVehicle,trailer:boolean,countries:string[]){
 const required=new Set(['category','f1','f2']);
 if(countries.some(c=>['HU','RO','MD'].includes(c)))required.add('seats');
 if(countries.includes('SI'))required.add('frontHeightMm');
 if(countries.includes('CZ')){required.add('fuel');required.add('wheels');}
 if(vehicle==='heavy'||vehicle==='other'){required.add('axles');required.add('euro');}
 if(trailer){required.add('trailer-category');required.add('trailer-f1');required.add('trailer-f2');}
 return required;
}
export function validatePurchaseTechnical(p:PurchaseTechnical,vehicle:PurchaseVehicle,trailer:boolean,countries:string[]){
 const errors:Record<string,string>={};
 const required=requiredPurchaseFields(vehicle,trailer,countries);
 for(const key of required)if(!p[key]?.trim()||p[key]==='unknown')errors['technical-'+key]='Completează acest câmp din talon pentru țările selectate.';
 const bounds:Record<string,[number,number]>={f1:[1,200000],f2:[1,200000],f3:[1,200000],seats:[1,100],axles:[2,10],co2:[1,5],frontHeightMm:[100,5000],wheels:[2,30],'trailer-f1':[1,200000],'trailer-f2':[1,200000],'trailer-axles':[1,10]};
 for(const [key,[min,max]] of Object.entries(bounds))if(required.has(key)&&p[key]&&(!/^\d+$/.test(p[key])||Number(p[key])<min||Number(p[key])>max))errors['technical-'+key]='Introdu o valoare între '+min+' și '+max+'.';
 if(p.category&&!['M1','M1G','N1','N1G','N2','N3','M2','M3'].includes(p.category))errors['technical-category']='Verifică categoria J din talon.';
 if(Number(p.f2)>Number(p.f1)&&p.f1)errors['technical-f2']='Masa F.2 nu poate depăși masa F.1.';
 if(['car','van'].includes(vehicle)&&Number(p.f1)>3500)errors['technical-f1']='Peste 3,5 t: selectează încadrarea separată a vehiculului.';
 if(vehicle==='car'&&p.category&&!['M1','M1G'].includes(p.category))errors['technical-category']='Pentru autoturism, verifică categoria M1 din talon.';
 if(vehicle==='van'&&p.category&&!['N1','N1G'].includes(p.category))errors['technical-category']='Pentru autoutilitară ușoară, verifică categoria N1 din talon.';
 if(trailer){
  if(p['trailer-category']&&!['O1','O2','O3','O4'].includes(p['trailer-category']))errors['technical-trailer-category']='Verifică categoria O a remorcii.';
  if(p['trailer-f1']&&Number(p['trailer-f2'])>Number(p['trailer-f1']))errors['technical-trailer-f2']='Masa F.2 a remorcii nu poate depăși F.1.';
  const mass=Number(p['trailer-f1']);
  if((p['trailer-category']==='O1'&&mass>750)||(p['trailer-category']==='O2'&&(mass<=750||mass>3500)))errors['technical-trailer-f1']='Masa remorcii nu corespunde categoriei O1/O2.';
 }
 return errors;
}
