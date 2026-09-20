import {isCalendarDate} from './catalog.ts';
import {isPreviewPlateValid, type CountryCode} from './countries.ts';

// Research snapshot for UX only, deliberately separate from the sellable catalog.
// An adapter must revalidate category, coverage, start/end instants and price server-side.
export const purchaseReviewDate='2026-09-20';
export type PurchaseVehicle='car'|'van'|'heavy'|'other';
export type DurationOption={id:string;label:string;note?:string;time?:boolean;annual?:boolean};
const days=(n:number):DurationOption=>({id:`d${n}`,label:n===1?'1 zi':`${n} zile`});
const month=(n:number):DurationOption=>({id:`m${n}`,label:n===1?'1 lună':`${n} luni`});
const annual:DurationOption={id:'annual',label:'Anuală',annual:true,note:'An de valabilitate, nu 365 de zile de la cumpărare.'};
export const purchaseGuides:Record<CountryCode,{options:DurationOption[];source:string;note:string;heavy:string;vin:boolean}>={
 AT:{options:[days(1),days(10),month(2),annual],source:'https://help.asfinag.at/en/vignette-and-section-tolls/',note:'1 zi înseamnă zi calendaristică. Pentru 2 luni/anuală, activarea depinde de canalul de vânzare și de statutul clientului; regula de 18 zile trebuie verificată. Tronsoanele speciale se verifică separat.',heavy:'GO-Maut: distanță, axe și emisii; dispozitiv de bord acceptat.',vin:false},
 HU:{options:[days(1),{...days(10),note:'Produsul denumit săptămânal are 10 zile.'},month(1),annual],source:'https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-arak',note:'Selectăm produse naționale. Cele anuale județene/regionale au acoperire diferită și nu sunt incluse aici. D1/D2 depinde de categoria din talon și de locuri.',heavy:'HU-GO pentru marfă/autobuze grele: rută și clasificare confirmate de operator.',vin:false},
 RO:{options:[days(1),days(10),days(30),days(60),month(12)],source:'https://legislatie.just.ro/Public/DetaliiDocument/310825',note:'Rovinieta și taxele de pod se verifică separat. Categoria și regulile aplicabile datei de activare trebuie confirmate.',heavy:'Marfă >3,5 t: tranziție rovinietă/TollRo la 1 octombrie 2026 conform textului consultat; fără tarifare automată în acest demo.',vin:true},
 BG:{options:[{...days(1),label:'24 de ore',time:true},{id:'weekend',label:'Weekend',note:'Vineri de la 12:00 până duminică la 23:59; cumpărarea în weekend nu oferă valabilitate retroactivă.'},days(7),month(1),month(3),month(12)],source:'https://apps.apple.com/me/app/bgtoll/id1446451736',note:'Vinieta zilnică este disponibilă din 3 februarie 2026. Pentru 24 de ore se alege și ora locală. Weekendul nu înseamnă oricare două zile.',heavy:'BG Toll: permis de rută sau dispozitiv acceptat; contează ruta, categoria, emisiile și axele.',vin:false},
 CZ:{options:[days(1),days(10),days(30),{id:'year',label:'1 an'}],source:'https://edalnice.gov.cz/en',note:'1 zi expiră la miezul nopții locale. Propulsia și emisiile pot schimba tariful sau eligibilitatea pentru scutire; nu presupunem o scutire.',heavy:'MYTO CZ: distanță, masă, axe, EURO și CO₂. Remorca poate schimba categoria în cursă.',vin:false},
 SK:{options:[days(1),days(10),days(30),days(365)],source:'https://eznamka.sk/en/evignettes/types-and-prices',note:'365 de zile este diferit de anul calendaristic. Pentru M1/N1 cu remorcă O1/O2, suma maselor tehnice peste 3,5 t implică o vinietă și pentru remorcă.',heavy:'eMyto: verificare separată pentru vehicul greu; excepția M1 trebuie tratată înainte de alegerea sistemului.',vin:false},
 SI:{options:[days(7),month(1),{id:'year',label:'1 an'}],source:'https://evinjeta.dars.si/en',note:'Clasele 2A/2B se confirmă folosind lista DARS. Tunelul Karawanken se tratează separat. Produsele motocicletelor au alte durate.',heavy:'DarsGo: taxare pe tronsoane, dispozitiv de bord, axe și emisii.',vin:false},
 CH:{options:[annual],source:'https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase',note:'Numai anuală: 1 decembrie din anul precedent–31 ianuarie din anul următor. Remorca eligibilă necesită vinietă proprie.',heavy:'LSVA/PSVA: marfă, persoane și remorci pot avea regimuri diferite; fără conversie automată într-o vinietă.',vin:false},
 MD:{options:[days(7),days(15),days(30),days(90),days(180)],source:'https://evinieta.gov.md/Home/Legislation',note:'Opțiuni orientative pentru autoturisme străine. Peste 180 de zile, categoria fiscală și obligația pe durata șederii necesită verificare separată.',heavy:'Moldova are și viniete pentru camioane/autobuze: categoria, durata și autorizațiile se confirmă separat; nu presupunem taxare la kilometru.',vin:true},
};
export function availableDurations(country:CountryCode,vehicle:PurchaseVehicle){
 if(vehicle==='heavy'||vehicle==='other'||(country==='MD'&&vehicle!=='car'))return [];
 return purchaseGuides[country].options;
}
export type Selection={country:CountryCode;duration:string;start:string;time:string;year:string};
export type PurchaseDraft={plate:string;registration:string;vin:string;legacyVin:boolean;vehicle:PurchaseVehicle;selections:Selection[]};
export function validatePurchaseDraft(draft:PurchaseDraft,today:string):Record<string,string>{
 const errors:Record<string,string>={};
 if(!isPreviewPlateValid(draft.plate))errors.plate='Introdu numărul de înmatriculare (2–12 litere sau cifre).';
 if(!/^[A-Z]{2}$/.test(draft.registration))errors.registration='Alege țara de înmatriculare.';
 const vin=draft.vin.trim().toUpperCase();
 if(draft.selections.some(s=>purchaseGuides[s.country].vin)&&!vin)errors.vin='Completează seria de șasiu pentru țările selectate.';
 if(vin&&!(draft.legacyVin?/^[A-Z0-9]{3,32}$/:/^[A-HJ-NPR-Z0-9]{17}$/).test(vin))errors.vin=draft.legacyVin?'Verifică seria exactă din talon (3–32 caractere).':'VIN-ul modern are 17 caractere, fără I, O sau Q. Pentru un vehicul vechi, bifează seria nestandard.';
 if(!draft.selections.length)errors.countries='Selectează cel puțin o țară.';
 if(new Set(draft.selections.map(s=>s.country)).size!==draft.selections.length)errors.countries='Țara este duplicată.';
 for(const s of draft.selections){
  const options=availableDurations(s.country,draft.vehicle);
  if(s.country==='MD'&&draft.registration==='MD')errors['duration-MD']='Vinieta din acest flux este pentru vehicule înmatriculate în afara Moldovei.';
  if(!options.length&&s.duration)errors['duration-'+s.country]='Vehiculul necesită o încadrare separată, nu un produs de autoturism.';
  if(!isCalendarDate(s.start)||s.start<today)errors[`start-${s.country}`]='Alege o dată validă, începând de astăzi.';
  if(!options.length)continue; // A route/review request, never a time product.
  const option=options.find(p=>p.id===s.duration);
  if(!option){errors[`duration-${s.country}`]='Alege una dintre duratele acestei țări.';continue;}
  if(option.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time))errors[`time-${s.country}`]='Alege ora locală de activare.';
  if(option.annual){
   const year=Number(s.year);
   if(!/^\d{4}$/.test(s.year)||year<Number(today.slice(0,4))||year>Number(today.slice(0,4))+1)errors[`year-${s.country}`]='Alege anul de valabilitate.';
   else if(isCalendarDate(s.start)){
    const earliest=s.country==='HU'?`${year}-01-01`:`${year-1}-12-01`;
    if(s.start<earliest||s.start>`${year+1}-01-31`)errors[`start-${s.country}`]='Data călătoriei nu este acoperită de anul selectat.';
   }
  }
  if(s.duration==='weekend'&&isCalendarDate(s.start)&&![0,5,6].includes(new Date(s.start+'T12:00:00Z').getUTCDay()))errors[`start-${s.country}`]='Alege o zi de vineri, sâmbătă sau duminică. Produsul expiră la sfârșitul acelui weekend.';
 }
 return errors;
}
export function trailerGuidance(country:CountryCode,vehicle:PurchaseVehicle){
 if(vehicle==='heavy'||vehicle==='other')return 'Ansamblul se verifică separat: mase, axe și configurația din cursă. Nu adunăm automat masele capului tractor și semiremorcii.';
 if(['AT','CZ','SI'].includes(country))return 'În regimul ușor, remorca nu are vinietă separată; categoria vehiculului tractor trebuie confirmată.';
 if(country==='HU')return vehicle==='car'?'D1 cu remorcă: inclusă numai dacă încadrarea D1 este confirmată.':'D2 cu remorcă: se verifică și produsul U, separat.';
 if(country==='CH')return 'Remorcă eligibilă până la 3,5 t: vinietă anuală separată. Remorca grea necesită altă verificare.';
 if(country==='BG'||country==='SK')return 'Peste 3,5 t pentru ansamblul eligibil poate fi necesară o vinietă separată pentru remorcă. Verificăm masele și categoriile din talon înainte de ofertă.';
 return 'Categoria și configurația ansamblului vor fi confirmate de emitent înainte de ofertă.';
}
