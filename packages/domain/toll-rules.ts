import {readTechnical,type TechnicalProfile} from './vehicle-profile.ts';
import {isCalendarDate} from './catalog.ts';
export const ruleSources={
 AT:'https://help.asfinag.at/en/vignette-and-section-tolls/vignette/',
 HU:'https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates',
 RO:'https://www.setre.gov.ro/',
 BG:'https://web.bgtoll.bg/',
 CZ:'https://edalnice.gov.cz/en',
 SK:'https://eznamka.sk/en/evignettes/types-and-prices',
 SI:'https://evinjeta.dars.si/en',
 CH:'https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase',
 MD:'https://evinieta.gov.md/Home/FAQ',
 DE:'https://www.toll-collect.de/en/toll_collect/rund_um_die_maut/3_5_tonnen_maut/p1745_3_5_tonnen_maut.html',
 IT:'https://www.autostrade.it/en/servizi-al-cliente/pedaggio/come-si-calcola-il-pedaggio'
} as const;
export const rulesReviewedOn='2026-09-20';
export type TollAssessment={country:string;system:string;vehicleClass:string|null;trailer:'separate'|'included'|'review';needsReview:boolean;source:string|null;reasons:string[];payable:false;totalMinor:null};
// Classification is preliminary. It never certifies exemption, route coverage, price or an issued right.
// Rules must be refreshed before using a later year's tariff/catalog.
export function assessTolls(country:string,input:unknown,registration:string,entry:string,exit=entry):TollAssessment{
 const result:TollAssessment={country,system:'review',vehicleClass:null,trailer:'review',needsReview:true,source:ruleSources[country as keyof typeof ruleSources]??null,reasons:[],payable:false,totalMinor:null};
 const v=readTechnical(input);
 const stop=(reason:string)=>({...result,reasons:[reason]});
 if(!v)return stop('Completează datele vehiculului.');
 if(!isCalendarDate(entry)||!isCalendarDate(exit)||exit<entry)return stop('Verifică perioada călătoriei.');
 if(entry<rulesReviewedOn||exit>'2026-12-31')return stop('Regulile trebuie reverificate pentru perioada aleasă.');
 if(!result.source)return stop('Țară în afara acoperirii verificate.');
 const set=(system:string,vehicleClass:string|null,trailer:TollAssessment['trailer']='included',review=false)=>Object.assign(result,{system,vehicleClass,trailer,needsReview:review});
 const trailer=v.trailer;
 const m1=['M1','M1G'].includes(v.category);
 const n1=['N1','N1G'].includes(v.category);
 const combine=(mass:'f1'|'f2')=>v[mass]&&trailer?.[mass]?v[mass]!+trailer[mass]!:null;
 switch(country){
 case 'AT':
  if(!v.f1)return stop('Completează masa F.1 din talon.');
  if(v.f1<=3500)set('vignette','≤ 3,5 t');
  else if(!v.f2||v.f2<=3500){set('review',null,'review',true);result.reasons.push('Posibilă derogare tranzitorie până în 2029: trebuie verificate prima înmatriculare și istoricul reducerii masei.');}
  else set('GO-Maut',null,'included',true);
  result.reasons.push('Tronsoanele speciale și excepțiile depind de traseul efectiv.');
  break;
 case 'HU':
  if(!v.f1||v.category==='unknown'||!v.seats)return stop('Completează F.1, categoria J și numărul de locuri S.1.');
  if(v.f1>3500&&(v.kind==='goods'||v.kind==='bus'))set('HU-GO',null,'included',true);
  else {const d1=m1&&v.f1<=3500&&v.seats<=7;set('vignette',d1?'D1':'D2',trailer&&!d1?'separate':'included');}
  break;
 case 'BG':
  if(!v.f1)return stop('Completează masa F.1 din talon.');
  if(v.kind==='motorhome'){set('review',null,'review',true);result.reasons.push('Regimul autorulotelor trebuie confirmat în catalogul emitentului.');}
  else if(v.f1>3500)set('BG Toll',null,'included',true);
  else if(trailer){const sum=combine('f1');if(!sum)return stop('Completează masa F.1 a remorcii.');set('vignette','≤ 3,5 t',sum>3500?'separate':'included');}
  else set('vignette','≤ 3,5 t');
  break;
 case 'CZ':
  if(!v.f2)return stop('Completează masa maximă autorizată F.2.');
  set(v.f2<=3500?'vignette':'MYTO CZ',v.f2<=3500?'≤ 3,5 t':null,'included',v.f2>3500);
  result.reasons.push('Propulsia, emisiile și eventualele scutiri trebuie confirmate înainte de tarifare.');
  break;
 case 'SK':
  if(!v.f1||v.category==='unknown')return stop('Completează masa F.1 și categoria J.');
  if(!m1&&v.f1>3500)set('eMyto',null,'included',true);
  else if(trailer){
   if(!(m1||n1)||!['O1','O2'].includes(trailer.category))return stop('Ansamblul necesită verificarea categoriei remorcii și a sistemului de taxare.');
   const sum=combine('f1');if(!sum)return stop('Completează masa F.1 a remorcii.');
   set('vignette','VEHICLE',sum>3500?'separate':'included');
  }else set('vignette','VEHICLE');
  break;
 case 'SI':
  if(!v.f2)return stop('Completează masa maximă autorizată F.2.');
  if(v.f2>3500)set('DarsGo',null,'included',true);
  else if(v.kind==='motorhome')set('vignette','2A');
  else if(!v.frontHeightMm||v.frontHeightMm===1300)return stop('Verifică încadrarea 2A/2B în lista DARS a vehiculelor măsurate.');
  else set('vignette',v.frontHeightMm<1300?'2A':'2B');
  result.reasons.push('Clasa trebuie confirmată în lista DARS; tunelul Karawanken are taxă separată.');
  break;
 case 'CH':
  if(!v.f2)return stop('Completează masa maximă autorizată F.2.');
  if(trailer&&(!trailer.f2||trailer.f2>3500))return stop('Remorca grea necesită verificarea regimului LSVA/PSVA și a vehiculului tractor.');
  if(v.f2>3500)set(v.kind==='goods'?'LSVA':'PSVA',null,trailer?'separate':'included',true);
  else set('vignette','≤ 3,5 t',trailer?'separate':'included');
  break;
 case 'MD':
  if(registration==='MD')return stop('Vehicul înmatriculat în Moldova: verifică regimul intern, separat de vinieta pentru vehicule străine.');
  set('vignette',null,'review',true);result.reasons.push('Categoria fiscală, remorca și eventualele autorizații trebuie confirmate cu emitentul.');break;
 case 'RO':
  if(!v.f2||v.category==='unknown')return stop('Completează F.2 și categoria J.');
  if(v.kind==='goods'&&v.f2>3500){
   if(entry<'2026-10-01'&&exit>='2026-10-01')return stop('Cursa traversează schimbarea regimului TollRo: calcul separat înainte și după 1 octombrie 2026.');
   set(entry>='2026-10-01'?'TollRo':'rovinieta',null,'included',true);
  }else set('rovinieta',null,'included',true);
  result.reasons.push('Categoria, norma Euro și taxele de pod se confirmă pentru data și ruta călătoriei.');break;
 case 'DE':
  if(!v.f1)return stop('Completează masa F.1 din talon.');
  set(v.kind==='goods'&&v.f1>3500?'LKW-Maut':'route-review',null,'included',true);
  result.reasons.push('Verificarea privește LKW-Maut; nu confirmă gratuitatea tuturor drumurilor sau scutirile.');break;
 case 'IT':
  set('distance-toll',null,'included',true);result.reasons.push('Tarif pe traseu și concesionar; contează axele ansamblului și înălțimea la axa față.');break;
 }
 return result;
}
export function assessCountries(countries:readonly string[],v:TechnicalProfile,registration:string,entry:string,exit:string){return countries.map(c=>assessTolls(c,v,registration,entry,exit));}
