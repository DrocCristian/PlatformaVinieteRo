'use client';
import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TravelPeriods from './travel-periods';
import {localToday,validateTravelPeriod,formatTravelDate,type TravelPeriod} from '../packages/domain/catalog';
import { ArrowRight, CarFront, Check, ChevronRight, Clock3, FileText, Headphones, Info, LockKeyhole, MapPin, Route, ShieldCheck, Smartphone, X } from 'lucide-react';
import { countries, toggleCountry, normalizePlate, isPreviewPlateValid, type CountryCode } from '../packages/domain/countries';
const EuropeMap=dynamic(()=>import('./europe-map'),{ssr:false,loading:()=> <div className="map-stage map-status">Se încarcă harta Europei…</div>});
function Flag({code}:{code:CountryCode}){return <span className={'flag flag-'+code} aria-hidden="true">{code==='CH'?'+':''}</span>;}
export default function Planner() {
  const [selected,setSelected]=useState<CountryCode[]>(['AT','HU','RO']);
  const [step,setStep]=useState(1);
  const [plate,setPlate]=useState('');
  const [registration,setRegistration]=useState('RO');
  const [confirmed,setConfirmed]=useState(false);
  const [periods,setPeriods]=useState<Partial<Record<CountryCode,TravelPeriod>>>({});
  const [periodError,setPeriodError]=useState('');
  const [error,setError]=useState('');
  const titleRef=useRef<HTMLHeadingElement>(null);
  const chosen=selected.map(code=>countries.find(country=>country.code===code)!);
  const onToggle=useCallback((code:CountryCode)=>{setSelected(current=>toggleCountry(current,code));setConfirmed(false);},[]);
  function goTo(next:number){setStep(next);setError('');setPeriodError('');requestAnimationFrame(()=>titleRef.current?.focus());}
  return <section className="planner" id="planifica" aria-label="Planificarea călătoriei">
    <div className="planner-grid">
      <div className="selection">
        {step===1?<><h2 ref={titleRef} tabIndex={-1} className="sr-only">Pe unde călătorești?</h2><EuropeMap selected={selected} onToggle={onToggle}/>
          <div className="country-picker" id="destinatii"><div className="picker-heading"><span><MapPin size={13}/>Personalizează călătoria</span><small>{selected.length} țări selectate</small></div><div className="country-grid">{countries.map(country=><button type="button" key={country.code} className={'country '+(selected.includes(country.code)?'selected':'')} aria-pressed={selected.includes(country.code)} onClick={()=>onToggle(country.code)}><Flag code={country.code}/><span>{country.name}</span>{selected.includes(country.code)?<Check size={12}/>:<span className="country-plus" aria-hidden="true">+</span>}</button>)}</div></div>
          <p className="map-disclaimer">Harta selectează țări; nu calculează traseul sau taxele speciale.</p>
        </>:<div className="vehicle-panel"><ol className="progress">{['Țările tale','Vehicul','Verificare'].map((label,i)=><li key={label} className={step===i+1?'current':''} aria-current={step===i+1?'step':undefined}><span>{i+1}</span>{label}</li>)}</ol>
          <h2 ref={titleRef} tabIndex={-1}>{step===2?'Cu ce vehicul pleci?':'Verifică planul călătoriei'}</h2>
          {step===2?<form id="vehicle-form" onSubmit={event=>{event.preventDefault();setPeriodError('');if(!isPreviewPlateValid(plate)){setError('Introdu între 2 și 12 litere sau cifre pentru această previzualizare.');return;}for(const code of selected){const problem=validateTravelPeriod(periods[code]??{entry:'',exit:''},localToday());if(problem){setError('');setPeriodError(countries.find(c=>c.code===code)!.name+': '+problem);return;}}goTo(3);}}>
            <p className="intro">Datele rămân în această pagină și se șterg la reîncărcare.</p><label htmlFor="registration">Țara de înmatriculare</label><select id="registration" value={registration} onChange={e=>{setRegistration(e.target.value);setConfirmed(false);}}>{[...countries,{code:'DE',name:'Germania'},{code:'FR',name:'Franța'},{code:'IT',name:'Italia'},{code:'OTHER',name:'Altă țară — eligibilitate de verificat'}].map(country=><option key={country.code} value={country.code}>{country.name}</option>)}</select>
            <label htmlFor="plate">Număr de înmatriculare</label><input id="plate" value={plate} maxLength={20} placeholder="Ex. B 123 ABC" autoComplete="off" aria-invalid={!!error} aria-describedby={error?'plate-error':'plate-help'} onChange={e=>{setPlate(e.target.value);setConfirmed(false);setError('');}}/><small id="plate-help">Validarea specifică țării se va face înainte de achiziție.</small>{error?<p id="plate-error" role="alert" className="error">{error}</p>:null}
            <label htmlFor="category">Vehicul pentru această previzualizare</label><select id="category"><option>Autoturism — categorie de confirmat</option></select><p className="info-note"><Info size={16}/>Eligibilitatea se verifică separat pentru fiecare produs.</p>
          <TravelPeriods selected={selected} periods={periods} error={periodError} onChange={(code,value)=>{setPeriods(current=>({...current,[code]:value}));setConfirmed(false);setPeriodError('');}}/>
          </form>:<><p className="intro">Asigură-te că numărul și țara de înmatriculare sunt corecte.</p><div className="plate-preview"><span>{registration==='OTHER'?'—':registration}</span><strong>{normalizePlate(plate)}</strong></div><div className="trip-review" aria-label="Perioadele călătoriei">{chosen.map(country=><div key={country.code}><strong>{country.name}</strong><small>{formatTravelDate(periods[country.code]?.entry??'')} → {formatTravelDate(periods[country.code]?.exit??'')}</small><Link href={'/catalog#'+country.code}>Vezi disponibilitatea vinietelor</Link></div>)}</div><label className="confirmation"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>Confirm datele vehiculului și perioadele călătoriei. Un număr sau o categorie greșită poate invalida o vinietă.</span></label><p className="info-note"><Info size={16}/>Perioadele și prețurile vor fi afișate din catalogul autorizat. Nu s-a creat nicio comandă.</p><button className="primary" disabled>{confirmed?'Achiziții disponibile în curând':'Confirmă datele pentru previzualizare'}</button></>}
          <div className="form-actions"><button className="secondary" onClick={()=>goTo(step-1)}>← Înapoi</button>{step===2?<button className="primary" type="submit" form="vehicle-form">Verifică datele<ArrowRight size={17}/></button>:null}</div>
        </div>}
      </div>
      <aside className="summary"><div className="summary-heading"><h3>Țările selectate</h3><button onClick={()=>{goTo(1);document.getElementById('destinatii')?.scrollIntoView({block:'nearest'});}}>Editează</button></div>
        <div className="chosen" aria-live="polite">{chosen.length===0?<div className="empty"><Route size={30}/><h4>Unde te duce drumul?</h4><p>Alege o țară pentru a începe.</p></div>:chosen.map(country=><div className="chosen-row" key={country.code}><Flag code={country.code}/><div><strong>{country.name}</strong><small>Catalog în pregătire</small></div><span className="price-pending">—</span><button aria-label={'Elimină '+country.name} onClick={()=>{onToggle(country.code);if(selected.length===1)goTo(1);}}><X size={13}/></button></div>)}</div>
        <div className="vehicle-summary"><div className="summary-heading"><h3>Vehiculul meu</h3><button disabled={!selected.length} onClick={()=>goTo(2)}>{plate?'Editează':'Adaugă'}</button></div><div className="vehicle-row"><CarFront size={27}/><div><strong>Autoturism</strong><small>{plate?normalizePlate(plate):'Completează datele vehiculului'}</small></div><ChevronRight size={15}/></div></div>
        <div className="summary-checkout"><div className="summary-total"><span>Total</span><strong>—</strong></div><p>Prețuri disponibile după activarea catalogului</p>{step===1?<button className="primary" disabled={!selected.length} onClick={()=>goTo(2)}>Continuă cu vehiculul<ArrowRight size={17}/></button>:<span className="checkout-pending"><LockKeyhole size={13}/>Plata nu este încă disponibilă</span>}<small className="secure-note"><ShieldCheck size={12}/>Previzualizare fără plăți sau emitere</small></div>
        <p className="summary-note">Produsele, perioadele și condițiile vor fi confirmate separat pentru fiecare țară.</p>
      </aside>
    </div>
    <aside className="phone-preview" aria-label="Previzualizarea călătoriei pe telefon">
      <div className="phone-notch"/><div className="phone-status"><span>9:41</span><span>▮▮▮ ▰</span></div>
      <h2>Călătoria mea</h2><p className="phone-subtitle">Totul pregătit pentru următorul drum</p>
      <div className="phone-countries">{chosen.length?chosen.slice(0,3).map(country=><div key={country.code}><Flag code={country.code}/><span><strong>{country.name}</strong><small>Vinietă în pregătire</small></span><em>Planificat</em></div>):<p>Alege țările de pe hartă.</p>}{chosen.length>3?<p className="more-countries">+ încă {chosen.length-3} țări selectate</p>:null}</div>
      <div className="phone-card"><Clock3 size={27}/><div><strong>Următoarea călătorie</strong><small>Pregătește perioada pentru fiecare țară.</small></div></div>
      <div className="phone-menu"><a href="#planifica"><CarFront size={20}/><span>Vehiculul meu</span><ChevronRight size={14}/></a><a href="#intrebari"><FileText size={20}/><span>Ghid de călătorie</span><ChevronRight size={14}/></a><a href="#intrebari"><Headphones size={20}/><span>Întrebări frecvente</span><ChevronRight size={14}/></a></div>
      <div className="phone-bottom"><Smartphone size={15}/><span>Previzualizarea contului mobil</span></div><div className="phone-home"/>
    </aside>
  </section>;
}
