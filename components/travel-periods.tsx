'use client';
import {translator,type Messages} from '../packages/i18n/public';
import {countries,type CountryCode} from '../packages/domain/countries';
import {localToday,type TravelPeriod} from '../packages/domain/catalog';
export default function TravelPeriods({selected,periods,onChange,error,messages={},invalidFields=[]}:{selected:CountryCode[];periods:Partial<Record<CountryCode,TravelPeriod>>;onChange:(code:CountryCode,value:TravelPeriod)=>void;error:string;messages?:Messages;invalidFields?:string[]}){
 const t=translator(messages);
 return <fieldset className="travel-periods"><legend>{t("Perioada în fiecare țară")}</legend><p>{t("Datele descriu călătoria dorită. Valabilitatea vinietelor va fi stabilită din produsele disponibile.")}</p>
 {selected.map(code=>{const country=countries.find(c=>c.code===code)!;const period=periods[code]??{entry:'',exit:''};return <div className="travel-country" key={code}><h3>{t(country.name)}</h3><div className="travel-dates"><div><label htmlFor={'entry-'+code}>{t("Intrare în ")}{t(country.name)}</label><input id={'entry-'+code} data-planner-field={'entry-'+code} aria-invalid={invalidFields.includes('entry-'+code)} type="date" value={period.entry} min={localToday()} aria-describedby={invalidFields.includes('entry-'+code)?'period-error':undefined} onChange={e=>onChange(code,{...period,entry:e.target.value})}/></div><div><label htmlFor={'exit-'+code}>{t("Ieșire din ")}{t(country.name)}</label><input id={'exit-'+code} data-planner-field={'exit-'+code} aria-invalid={invalidFields.includes('exit-'+code)} type="date" value={period.exit} min={period.entry||localToday()} aria-describedby={invalidFields.includes('exit-'+code)?'period-error':undefined} onChange={e=>onChange(code,{...period,exit:e.target.value})}/></div></div></div>})}
 {error&&<p className="error" id="period-error" role="alert">{error}</p>}</fieldset>;
}
