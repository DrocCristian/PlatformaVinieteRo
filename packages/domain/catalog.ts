import type { CountryCode } from './countries';
export type CountryCatalog = {
 code: CountryCode; status: 'pending'; products: readonly never[];
 prerequisites: readonly ['supplier', 'rules', 'prices'];
};
// A country becomes sellable only after a separate, verified supplier integration.
// No prices, legal durations or vehicle categories are inferred from a destination.
const pending=(code:CountryCode):CountryCatalog=>({code,status:'pending',products:[],prerequisites:['supplier','rules','prices']});
export const catalog:Record<CountryCode,CountryCatalog>={
 AT:pending('AT'),HU:pending('HU'),RO:pending('RO'),BG:pending('BG'),CZ:pending('CZ'),
 SK:pending('SK'),SI:pending('SI'),CH:pending('CH'),MD:pending('MD'),
};
export function isCalendarDate(value:string):boolean{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export type TravelPeriod={entry:string;exit:string};
export function validateTravelPeriod(period:TravelPeriod,today:string):string|null{
 if(!isCalendarDate(period.entry)||!isCalendarDate(period.exit))return 'Completează date calendaristice valide pentru intrare și ieșire.';
 if(period.entry<today)return 'Data intrării nu poate fi în trecut.';
 if(period.exit<period.entry)return 'Data ieșirii trebuie să fie în aceeași zi sau după intrare.';
 return null;
}
export function localToday(now=new Date()):string{
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
export function formatTravelDate(value:string):string{
 if(!isCalendarDate(value))return '—';
 const [year,month,day]=value.split('-');return day+'.'+month+'.'+year;
}
