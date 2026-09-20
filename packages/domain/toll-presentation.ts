import type {TollAssessment} from './toll-rules.ts';
export const tollSystemLabels:Record<string,string>={review:'De verificat',vignette:'Vinietă',rovinieta:'Rovinietă','route-review':'Verificarea traseului','distance-toll':'Taxă în funcție de distanță','GO-Maut':'GO-Maut','HU-GO':'HU-GO','BG Toll':'BG Toll','MYTO CZ':'MYTO CZ',eMyto:'eMyto',DarsGo:'DarsGo',LSVA:'LSVA',PSVA:'PSVA',TollRo:'TollRo','LKW-Maut':'LKW-Maut'};
const officialClasses=new Set(['≤ 3,5 t','D1','D2','2A','2B']);
export function tollSummary(rule:TollAssessment,t:(text:string)=>string){
 const system=t(tollSystemLabels[rule.system]??'De verificat');
 const category=rule.vehicleClass==='VEHICLE'?t('Vehicul'):rule.vehicleClass&&officialClasses.has(rule.vehicleClass)?rule.vehicleClass:'';
 return (rule.needsReview&&rule.system!=='review'?t('De verificat')+': ':'')+system+(category?' · '+category:'')+(rule.trailer==='separate'?' + '+t('Remorcă'):'');
}
