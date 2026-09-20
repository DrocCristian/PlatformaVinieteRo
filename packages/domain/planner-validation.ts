import {technicalSchema,type TechnicalProfile} from './vehicle-profile.ts';
import {routeRecordSchema} from './route-request.ts';
import {isCalendarDate,localToday,validateTravelPeriod,type TravelPeriod} from './catalog.ts';
import {isPreviewPlateValid,type CountryCode} from './countries.ts';
export type FieldErrors=Record<string,string>;
export type PlannerRoute={origin:string;destination:string;departure:string;returnDate:string};
const technicalTargets:Record<string,string>={
 'Masa F.2 nu poate depăși masa F.1.':'f2',
 'Verifică masele remorcii: F.2 nu poate depăși F.1.':'trailer.f2',
 'Pentru transport de marfă, verifică categoria N din talon.':'category',
 'Pentru autobuz, verifică categoria M2/M3 din talon.':'category',
 'Verifică masa vehiculului din categoria N2/N3.':'f1',
 'Pentru autoturism, verifică categoria M1 din talon.':'category',
 'Categoria N1 este limitată la 3.500 kg. Verifică talonul.':'f1',
 'Categoria O1 este limitată la 750 kg.':'trailer.f1',
 'Verifică masa și categoria O2 a remorcii.':'trailer.f1',
};
export function validatePlanner(plate:string,technical:TechnicalProfile,route:PlannerRoute,selected:CountryCode[],periods:Partial<Record<CountryCode,TravelPeriod>>,today=localToday()){
 const errors:FieldErrors={};
 if(!isPreviewPlateValid(plate))errors.plate='Introdu între 2 și 12 litere sau cifre pentru această previzualizare.';
 const vehicle=technicalSchema.safeParse(technical);
 if(!vehicle.success)for(const issue of vehicle.error.issues){
  const path=issue.path.join('.')||technicalTargets[issue.message]||'kind';
  errors['technical.'+path]??=issue.code==='custom'?issue.message:'Verifică datele din talon și ale remorcii.';
 }
 const hasRoute=Object.values(route).some(value=>value.trim()!=='');
 const trip=hasRoute?routeRecordSchema.safeParse(route):null;
 if(trip&&!trip.success)for(const issue of trip.error.issues){
  const path=issue.path.join('.')||(issue.message.includes('diferite')?'destination':issue.message.includes('Ultima zi')?'returnDate':'departure');
  errors['route.'+path]??=issue.code==='custom'?issue.message:'Completează plecarea, destinația și perioada corectă.';
 }
 if(trip?.success&&trip.data.departure<today)errors['route.departure']='Data plecării nu poate fi în trecut.';
 for(const code of selected){
  const period=periods[code]??{entry:'',exit:''};
  const problem=validateTravelPeriod(period,today);
  if(problem){
   const field=!isCalendarDate(period.entry)||period.entry<today?'entry':'exit';
   errors[field+'-'+code]=problem;
  }else if(trip?.success){
   if(period.entry<trip.data.departure||period.entry>trip.data.returnDate)errors['entry-'+code]='Perioada în țară trebuie să fie inclusă în perioada cursei.';
   if(period.exit>trip.data.returnDate||period.exit<trip.data.departure)errors['exit-'+code]='Perioada în țară trebuie să fie inclusă în perioada cursei.';
  }
 }
 return errors;
}
