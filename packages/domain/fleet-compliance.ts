import {fleetCountries} from './fleet.ts';
import {isCalendarDate} from './catalog.ts';
export const fleetSources={
 AT:'https://www.asfinag.at/maut-vignette/mautordnung/',
 HU:'https://www.hu-go.hu/',
 RO:'https://portal.etoll.ro/',
 BG:'https://web.bgtoll.bg/Content/tc/termsandconditions.html?languageCultureName=en-GB',
 CZ:'https://myto.gov.cz/en/charged-vehicles/vehicles-subject-to-toll-payment',
 SK:'https://eznamka.sk/en/evignettes/legislation',
 SI:'https://www.gov.si/teme/cestnina/',
 CH:'https://www.bazg.admin.ch/de/schwerverkehrsabgabe-lsva-psva-schweiz',
 MD:'https://evinieta.gov.md/Home/FAQ'
} as const;
export type CountryApproval={
 country:string;product:string;ruleVersion:string;source:string;
 validFrom:string;validUntil:string;
 legalReview:'pending'|'approved';contract:'pending'|'approved';
 taxReview:'pending'|'approved';integration:'pending'|'certified';
};
// Operator pages identify the system, not an authorisation or a completed legal review.
export const fleetReadiness=fleetCountries.map(country=>({
 country,source:fleetSources[country],reviewedOn:'2026-09-20',
 legalReview:'pending',contract:'pending',taxReview:'pending',integration:'pending'
}));
export function checkoutBlockers(approvals:CountryApproval[],requests:{country:string;product:string;start:string;end:string}[]){
 if(!requests.length)return ['Comanda nu conține produse.'];
 return requests.flatMap(r=>{
  if(!isCalendarDate(r.start)||!isCalendarDate(r.end)||r.end<r.start)return [r.country+': perioadă invalidă.'];
  const a=approvals.find(x=>x.country===r.country&&x.product===r.product&&x.validFrom<=r.start&&x.validUntil>=r.end);
  if(!a)return [r.country+': lipsesc reguli aprobate pentru produs și întreaga perioadă.'];
  const blocks:string[]=[];
  if(!a.ruleVersion||!a.source||a.legalReview!=='approved')blocks.push('verificare juridică');
  if(a.contract!=='approved')blocks.push('contract');
  if(a.taxReview!=='approved')blocks.push('facturare');
  if(a.integration!=='certified')blocks.push('integrare');
  return blocks.length?[r.country+': '+blocks.join(', ')+'.']:[];
 });
}
