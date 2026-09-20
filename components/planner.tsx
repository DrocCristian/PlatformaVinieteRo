'use client';
import {translator,localizedPath,type Locale,type Messages} from '../packages/i18n/public';
import { useCallback, useRef, useState } from 'react';
import VehicleDetails from './vehicle-details';
import RouteFields,{emptyRoute} from './route-fields';
import {emptyTechnical,kindLabels} from '../packages/domain/vehicle-profile';
import {validatePlanner,type FieldErrors} from '../packages/domain/planner-validation';
import {tollSummary} from '../packages/domain/toll-presentation';
import {focusPlannerField} from './planner-focus';
import {assessTolls} from '../packages/domain/toll-rules';
import EuropeMap from './europe-map';
import Link from 'next/link';
import TravelPeriods from './travel-periods';
import {formatTravelDate,type TravelPeriod} from '../packages/domain/catalog';
import { ArrowRight, CarFront, Check, ChevronRight, Clock3, FileText, Headphones, Info, LockKeyhole, MapPin, Route, ShieldCheck, Smartphone, X } from 'lucide-react';
import { countries, toggleCountry, normalizePlate, type CountryCode } from '../packages/domain/countries';
function Flag({code}:{code:CountryCode}){return <span className={'flag flag-'+code} aria-hidden="true">{code==='CH'?'+':''}</span>;}
export default function Planner({locale='ro',messages={}}:{locale?:Locale;messages?:Messages}) {
 const t=translator(messages);
 const [technical,setTechnical]=useState(emptyTechnical);
 const [route,setRoute]=useState(emptyRoute);
  const [selected,setSelected]=useState<CountryCode[]>(['AT','HU','RO']);
  const [step,setStep]=useState(1);
  const [plate,setPlate]=useState('');
  const [registration,setRegistration]=useState('RO');
  const [confirmed,setConfirmed]=useState(false);
  const [periods,setPeriods]=useState<Partial<Record<CountryCode,TravelPeriod>>>({});
  const [fieldErrors,setFieldErrors]=useState<FieldErrors>({});
  const error=fieldErrors.plate??'';
  const periodIssues=Object.entries(fieldErrors).filter(([field])=>/^(entry|exit)-/.test(field));
  const periodError=periodIssues.map(([field,message])=>t(countries.find(c=>c.code===field.split('-')[1])!.name)+': '+t(message)).join(' ');
  function clearErrors(){setFieldErrors({});}
  const titleRef=useRef<HTMLHeadingElement>(null);
  const chosen=selected.map(code=>countries.find(country=>country.code===code)!);
  const onToggle=useCallback((code:CountryCode)=>{setSelected(current=>toggleCountry(current,code));setConfirmed(false);},[]);
  function goTo(next:number){setStep(next);clearErrors();requestAnimationFrame(()=>titleRef.current?.focus());}
  return <section className="planner" id="planifica" aria-label={t("Planificarea călătoriei")}>
    <div className="planner-grid">
      <div className="selection">
        {step===1?<><h2 ref={titleRef} tabIndex={-1} className="sr-only">{t("Pe unde călătorești?")}</h2><EuropeMap messages={messages} selected={selected} onToggle={onToggle}/>
          <div className="country-picker" id="destinatii"><div className="picker-heading"><span><MapPin size={13}/>{t("Personalizează călătoria")}</span><small>{selected.length}{t(" țări selectate")}</small></div><div className="country-grid">{countries.map(country=><button type="button" key={country.code} className={'country '+(selected.includes(country.code)?'selected':'')} aria-pressed={selected.includes(country.code)} onClick={()=>onToggle(country.code)}><Flag code={country.code}/><span>{t(country.name)}</span>{selected.includes(country.code)?<Check size={12}/>:<span className="country-plus" aria-hidden="true">+</span>}</button>)}</div></div>
          <p className="map-disclaimer">{t("Harta selectează țări; nu calculează traseul sau taxele speciale.")}</p>
        </>:<div className="vehicle-panel"><ol className="progress">{[t("Țările tale"),t("Vehicul"),t("Verificare")].map((label,i)=><li key={label} className={step===i+1?'current':''} aria-current={step===i+1?'step':undefined}><span>{i+1}</span>{label}</li>)}</ol>
          <h2 ref={titleRef} tabIndex={-1}>{step===2?t("Cu ce vehicul pleci?"):t("Verifică planul călătoriei")}</h2>
          {step===2?<form id="vehicle-form" noValidate onSubmit={event=>{
            event.preventDefault();
            const form=event.currentTarget;
            const next=validatePlanner(plate,technical,route,selected,periods);
            setFieldErrors(next);
            const first=Object.keys(next)[0];
            if(first){requestAnimationFrame(()=>focusPlannerField(form,Object.keys(next)));return;}
            goTo(3);
          }}>
            <p className="intro">{t("Datele rămân în această pagină și se șterg la reîncărcare.")}</p><label htmlFor="registration">{t("Țara de înmatriculare")}</label><select id="registration" value={registration} onChange={e=>{setRegistration(e.target.value);setConfirmed(false);}}>{[...countries,{code:'DE',name:t("Germania")},{code:'FR',name:t("Franța")},{code:'IT',name:t("Italia")},{code:'OTHER',name:t("Altă țară — eligibilitate de verificat")}].map(country=><option key={country.code} value={country.code}>{t(country.name)}</option>)}</select>
            <label htmlFor="plate">{t("Număr de înmatriculare")}</label><input id="plate" data-planner-field="plate" value={plate} maxLength={20} placeholder={t("Ex. B 123 ABC")} autoComplete="off" aria-invalid={!!error} aria-describedby={error?'plate-error':'plate-help'} onChange={e=>{setPlate(e.target.value);setConfirmed(false);clearErrors();}}/><small id="plate-help">{t("Validarea specifică țării se va face înainte de achiziție.")}</small>{error?<p id="plate-error" role="alert" className="error">{t(error)}</p>:null}
            <VehicleDetails errors={fieldErrors} messages={messages} value={technical} onChange={v=>{setTechnical(v);setConfirmed(false);clearErrors();}}/><RouteFields errors={fieldErrors} messages={messages} value={route} onChange={v=>{setRoute(v);setConfirmed(false);clearErrors();}}/><p className="info-note"><Info size={16}/>{t("Eligibilitatea se verifică separat pentru fiecare produs.")}</p>
          <TravelPeriods invalidFields={periodIssues.map(([field])=>field)} messages={messages} selected={selected} periods={periods} error={periodError} onChange={(code,value)=>{setPeriods(current=>({...current,[code]:value}));setConfirmed(false);clearErrors();}}/>
          </form>:<><p className="intro">{t("Asigură-te că numărul și țara de înmatriculare sunt corecte.")}</p><div className="plate-preview"><span>{registration==='OTHER'?'—':registration}</span><strong>{normalizePlate(plate)}</strong></div>{route.origin&&<p>{route.origin} → {route.destination}</p>}<p>{t(kindLabels[technical.kind])} · {technical.f1??'—'} kg{technical.trailer?' + '+t('Remorcă'):''}</p><div className="trip-review" aria-label={t("Perioadele călătoriei")}>{chosen.map(country=><div key={country.code}><strong>{t(country.name)}</strong>{(()=>{const rule=assessTolls(country.code,technical,registration,periods[country.code]?.entry??'',periods[country.code]?.exit??'');return <><small>{tollSummary(rule,t)}</small>{rule.reasons.length>0&&<ul className="assessment-reasons">{rule.reasons.map(reason=><li key={reason}>{t(reason)}</li>)}</ul>}{rule.needsReview&&<button type="button" className="review-edit" onClick={()=>goTo(2)}>{t('Verifică datele')}</button>}</>;})()}<small>{formatTravelDate(periods[country.code]?.entry??'')} → {formatTravelDate(periods[country.code]?.exit??'')}</small><Link href={localizedPath(locale,'/catalog')+'#'+country.code}>{t("Vezi disponibilitatea vinietelor")}</Link></div>)}</div><label className="confirmation"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>{t("Confirm datele vehiculului și perioadele călătoriei. Un număr sau o categorie greșită poate invalida o vinietă.")}</span></label><p className="info-note"><Info size={16}/>{t("Perioadele și prețurile vor fi afișate din catalogul autorizat. Nu s-a creat nicio comandă.")}</p><button className="primary" disabled>{confirmed?t("Achiziții disponibile în curând"):t("Confirmă datele pentru previzualizare")}</button></>}
          <div className="form-actions"><button className="secondary" onClick={()=>goTo(step-1)}>{t("← Înapoi")}</button>{step===2?<button className="primary" type="submit" form="vehicle-form">{t("Verifică datele")}<ArrowRight size={17}/></button>:null}</div>
        </div>}
      </div>
      <aside className="summary"><div className="summary-heading"><h3>{t("Țările selectate")}</h3><button onClick={()=>{goTo(1);document.getElementById('destinatii')?.scrollIntoView({block:'nearest'});}}>{t("Editează")}</button></div>
        <div className="chosen" aria-live="polite">{chosen.length===0?<div className="empty"><Route size={30}/><h4>{t("Unde te duce drumul?")}</h4><p>{t("Alege o țară pentru a începe.")}</p></div>:chosen.map(country=><div className="chosen-row" key={country.code}><Flag code={country.code}/><div><strong>{t(country.name)}</strong><small>{t("Catalog în pregătire")}</small></div><span className="price-pending">—</span><button aria-label={t("Elimină ")+t(country.name)} onClick={()=>{onToggle(country.code);if(selected.length===1)goTo(1);}}><X size={13}/></button></div>)}</div>
        <div className="vehicle-summary"><div className="summary-heading"><h3>{t("Vehiculul meu")}</h3><button disabled={!selected.length} onClick={()=>goTo(2)}>{plate?t("Editează"):t("Adaugă")}</button></div><div className="vehicle-row"><CarFront size={27}/><div><strong>{t(kindLabels[technical.kind])}</strong><small>{plate?normalizePlate(plate):t("Completează datele vehiculului")}</small></div><ChevronRight size={15}/></div></div>
        <div className="summary-checkout"><div className="summary-total"><span>{t("Total")}</span><strong>—</strong></div><p>{t("Prețuri disponibile după activarea catalogului")}</p>{step===1?<button className="primary" disabled={!selected.length} onClick={()=>goTo(2)}>{t("Continuă cu vehiculul")}<ArrowRight size={17}/></button>:<span className="checkout-pending"><LockKeyhole size={13}/>{t("Plata nu este încă disponibilă")}</span>}<small className="secure-note"><ShieldCheck size={12}/>{t("Previzualizare fără plăți sau emitere")}</small></div>
        <p className="summary-note">{t("Produsele, perioadele și condițiile vor fi confirmate separat pentru fiecare țară.")}</p>
      </aside>
    </div>
    <aside className="phone-preview" aria-label={t("Previzualizarea călătoriei pe telefon")}>
      <div className="phone-notch"/><div className="phone-status"><span>9:41</span><span>▮▮▮ ▰</span></div>
      <h2>{t("Călătoria mea")}</h2><p className="phone-subtitle">{t("Totul pregătit pentru următorul drum")}</p>
      <div className="phone-countries">{chosen.length?chosen.slice(0,3).map(country=><div key={country.code}><Flag code={country.code}/><span><strong>{t(country.name)}</strong><small>{t("Vinietă în pregătire")}</small></span><em>{t("Planificat")}</em></div>):<p>{t("Alege țările de pe hartă.")}</p>}{chosen.length>3?<p className="more-countries">{t("+ încă ")}{chosen.length-3}{t(" țări selectate")}</p>:null}</div>
      <div className="phone-card"><Clock3 size={27}/><div><strong>{t("Următoarea călătorie")}</strong><small>{t("Pregătește perioada pentru fiecare țară.")}</small></div></div>
      <div className="phone-menu"><a href="#planifica"><CarFront size={20}/><span>{t("Vehiculul meu")}</span><ChevronRight size={14}/></a><a href="#intrebari"><FileText size={20}/><span>{t("Ghid de călătorie")}</span><ChevronRight size={14}/></a><a href="#intrebari"><Headphones size={20}/><span>{t("Întrebări frecvente")}</span><ChevronRight size={14}/></a></div>
      <div className="phone-bottom"><Smartphone size={15}/><span>{t("Previzualizarea contului mobil")}</span></div><div className="phone-home"/>
    </aside>
  </section>;
}
