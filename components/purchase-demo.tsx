'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,CarFront,Truck,ShieldCheck,Plus,X,CalendarDays} from 'lucide-react';
import {countries,normalizePlate,type CountryCode} from '../packages/domain/countries';
import {formatTravelDate,localToday} from '../packages/domain/catalog';
import {availableDurations,purchaseGuides,trailerGuidance,validatePurchaseDraft,type PurchaseVehicle,type Selection} from '../packages/domain/purchase-preview';

const types:{id:PurchaseVehicle;title:string;detail:string}[]=[
 {id:'car',title:'Autoturism',detail:'Până la 3,5 t · categoria din talon se confirmă'},
 {id:'van',title:'Autoutilitară',detail:'Până la 3,5 t · transport de marfă'},
 {id:'heavy',title:'Camion / cap tractor',detail:'Peste 3,5 t · verificare pe rută'},
 {id:'other',title:'Autorulotă / autobuz / altul',detail:'Încadrare separată, după talon'},
];
function Flag({code}:{code:CountryCode}){return <span className={'flag flag-'+code} aria-hidden="true">{code==='CH'?'+':''}</span>;}
export default function PurchaseDemo(){
 const [step,setStep]=useState(1);
 const [technicalProfile,setTechnicalProfile]=useState<Record<string,string>>({});
 const [plate,setPlate]=useState('');
 const [registration,setRegistration]=useState('RO');
 const [vin,setVin]=useState('');
 const [legacyVin,setLegacyVin]=useState(false);
 const [vehicle,setVehicle]=useState<PurchaseVehicle>('car');
 const [trailer,setTrailer]=useState(false);
 const [trailerPlate,setTrailerPlate]=useState('');
 const [trailerCountry,setTrailerCountry]=useState('RO');
 const [trailerVin,setTrailerVin]=useState('');
 const [selections,setSelections]=useState<Selection[]>([]);
 const [errors,setErrors]=useState<Record<string,string>>({});
 const [notify,setNotify]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [route,setRoute]=useState({from:'',to:'',via:''});
 const title=useRef<HTMLHeadingElement>(null);
 const form=useRef<HTMLFormElement>(null);
 const technical=vehicle==='heavy'||vehicle==='other';
 function go(next:number){setStep(next);setErrors({});setConfirmed(false);requestAnimationFrame(()=>{title.current?.focus();title.current?.scrollIntoView({block:'start',behavior:'smooth'});});}
 function update(code:CountryCode,patch:Partial<Selection>){setSelections(old=>old.map(s=>s.country===code?{...s,...patch}:s));setErrors({});setConfirmed(false);}
 function toggle(code:CountryCode){setSelections(old=>old.some(s=>s.country===code)?old.filter(s=>s.country!==code):[...old,{country:code,duration:'',start:'',time:'',year:String(new Date().getFullYear())}]);setErrors({});}
 const attrs=(id:string)=>({id,'aria-invalid':!!errors[id],'aria-describedby':errors[id]?id+'-error':undefined});
 const error=(id:string)=>errors[id]?<span className="purchase-error" id={id+'-error'}>{errors[id]}</span>:null;
 function next(){
  const all=validatePurchaseDraft({plate,registration,vin,legacyVin,vehicle,selections},localToday());
  const current=step===1?Object.fromEntries(Object.entries(all).filter(([key])=>['plate','registration','vin'].includes(key))):all;
  if(trailer&&!/^[A-Z0-9]{2,12}$/.test(normalizePlate(trailerPlate)))current['trailer-plate']='Completează numărul remorcii.';
  if(trailer&&!/^[A-Z]{2}$/.test(trailerCountry))current['trailer-country']='Introdu codul țării din talon.';
  if(step===2&&technical&&(!route.from.trim()||!route.to.trim()))current['route-from']='Completează plecarea și destinația pentru verificarea traseului.';
  setErrors(current);
  if(Object.keys(current).length){requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());return;}
  go(step+1);
 }
 return <div className="purchase-demo">
  <header className="purchase-header"><Link href="/" className="purchase-logo">vignexo<span>↗</span></Link><span>Vinietele tale. Mai simplu.</span><Link href="/cont">Contul meu</Link></header>
  <div className="purchase-notice">PREVIZUALIZARE · Nu se emit viniete și nu se încasează plăți.</div>
  <main className="purchase-main">
   <div className="purchase-heading"><p className="purchase-eyebrow">PREGĂTIT PENTRU URMĂTORUL DRUM</p><h1>Alege perioada.<br/><span>Noi adunăm detaliile.</span></h1><p>Un vehicul, mai multe țări, un singur rezumat.</p></div>
   <ol className="purchase-steps" aria-label="Pașii comenzii">{['Vehiculul tău','Țări și durate','Verificare și plată'].map((label,i)=><li key={label} aria-current={step===i+1?'step':undefined}><span>{step>i+1?<Check size={17}/>:i+1}</span>{label}</li>)}</ol>
   <div className="purchase-grid"><form ref={form} noValidate onSubmit={e=>{e.preventDefault();next();}} className="purchase-card">
    <h2 tabIndex={-1} ref={title}>{step===1?'Cu ce vehicul călătorești?':step===2?'Unde ai nevoie de vinietă?':'Verifică înainte de plată'}</h2>
    {Object.keys(errors).length>0&&<div className="purchase-inset purchase-error" role="alert"><strong>Mai sunt date de verificat:</strong><ul>{Object.entries(errors).map(([key,message])=><li key={key}>{message}</li>)}</ul>{step>1&&<button type="button" className="purchase-back" onClick={()=>go(1)}>Editează datele vehiculului</button>}</div>}
    {step===1&&<>
     <p>Completezi datele o singură dată pentru toate țările alese.</p>
     <div className="purchase-fields"><label htmlFor="registration">Țara de înmatriculare<select {...attrs('registration')} value={registration} onChange={e=>setRegistration(e.target.value)}>{[...countries,{code:'DE',name:'Germania'},{code:'IT',name:'Italia'},{code:'FR',name:'Franța'},{code:'PL',name:'Polonia'},{code:'GR',name:'Grecia'},{code:'UA',name:'Ucraina'},{code:'GB',name:'Regatul Unit'}].map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>{error('registration')}</label>
     <label htmlFor="plate">Număr de înmatriculare<input {...attrs('plate')} value={plate} maxLength={20} autoComplete="off" placeholder="Ex. TM 12 ABC" onChange={e=>setPlate(e.target.value)}/>{error('plate')}</label></div>
     <label htmlFor="vin">VIN / seria de șasiu <span className="purchase-optional">— dacă este cerută de țara aleasă</span><input {...attrs('vin')} value={vin} maxLength={32} autoComplete="off" placeholder="Din câmpul E al talonului" onChange={e=>setVin(e.target.value.toUpperCase())}/>{error('vin')}</label>
     <label className="purchase-check"><input type="checkbox" checked={legacyVin} onChange={e=>setLegacyVin(e.target.checked)}/>Vehicul vechi cu serie de șasiu nestandard (verificare separată)</label>
     <fieldset className="purchase-type"><legend>Tipul vehiculului</legend><div>{types.map(t=><label key={t.id} className={vehicle===t.id?'is-selected':''}><input type="radio" name="vehicle" value={t.id} checked={vehicle===t.id} onChange={()=>{setVehicle(t.id);setSelections(old=>old.map(s=>({...s,duration:''})));}}/>{t.id==='heavy'?<Truck size={23}/>:<CarFront size={23}/>}<strong>{t.title}</strong><small>{t.detail}</small></label>)}</div></fieldset>
     <label className="purchase-check"><input type="checkbox" checked={trailer} onChange={e=>setTrailer(e.target.checked)}/>Am remorcă, rulotă sau semiremorcă</label>
     {trailer&&<div className="purchase-inset"><div className="purchase-fields"><label htmlFor="trailer-plate">Numărul remorcii<input {...attrs('trailer-plate')} value={trailerPlate} onChange={e=>setTrailerPlate(e.target.value)} maxLength={20}/>{error('trailer-plate')}</label><label htmlFor="trailer-country">Țara remorcii (cod)<input {...attrs('trailer-country')} value={trailerCountry} maxLength={2} onChange={e=>setTrailerCountry(e.target.value.toUpperCase())}/>{error('trailer-country')}</label></div><label htmlFor="trailer-vin">Seria remorcii (opțional în demo)<input id="trailer-vin" value={trailerVin} maxLength={32} onChange={e=>setTrailerVin(e.target.value.toUpperCase())}/></label><p>Masele, axele și categoria ansamblului vor fi verificate înainte de ofertă. Remorca nu înseamnă automat încă o vinietă.</p></div>}
     <p className="purchase-fine">Datele rămân în această pagină și se șterg la reîncărcare. Selecția tipului nu înlocuiește încadrarea din talon.</p>
    </>}
    {step===2&&<>
     <p>Alege țările, apoi durata disponibilă și data de început pentru fiecare.</p>
     <div className="purchase-countries" id="countries" tabIndex={-1} aria-invalid={!!errors.countries}>{countries.map(c=><button type="button" aria-pressed={selections.some(s=>s.country===c.code)} key={c.code} onClick={()=>toggle(c.code)}><Flag code={c.code}/>{c.name}{selections.some(s=>s.country===c.code)?<Check size={16}/>:<Plus size={16}/>}</button>)}</div>{error('countries')}
     {selections.map(s=>{const guide=purchaseGuides[s.country],options=availableDurations(s.country,vehicle),option=options.find(o=>o.id===s.duration);return <section key={s.country} className="purchase-country-card"><header><h3><Flag code={s.country}/>{countries.find(c=>c.code===s.country)!.name}</h3><button type="button" aria-label={'Elimină '+s.country} onClick={()=>toggle(s.country)}><X size={18}/></button></header>
      {options.length>0?<><label htmlFor={'duration-'+s.country}>Pentru cât timp?<select {...attrs('duration-'+s.country)} value={s.duration} onChange={e=>update(s.country,{duration:e.target.value,time:''})}><option value="">Alege durata</option>{options.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select>{error('duration-'+s.country)}</label>{option?.note&&<p>{option.note}</p>}</>:<div className="purchase-inset"><strong>Verificare separată a taxei</strong><p>{guide.heavy}</p></div>}
      <div className="purchase-fields"><label htmlFor={'start-'+s.country}>{option?.annual?'Data la care vei circula':'Data de început'}<input {...attrs('start-'+s.country)} type="date" value={s.start} onChange={e=>update(s.country,{start:e.target.value})}/>{error('start-'+s.country)}</label>
       {option?.time&&<label htmlFor={'time-'+s.country}>Ora locală (Bulgaria)<input {...attrs('time-'+s.country)} type="time" value={s.time} onChange={e=>update(s.country,{time:e.target.value})}/>{error('time-'+s.country)}</label>}
       {option?.annual&&<label htmlFor={'year-'+s.country}>Anul vinietei<input {...attrs('year-'+s.country)} type="number" value={s.year} onChange={e=>update(s.country,{year:e.target.value})}/>{error('year-'+s.country)}</label>}
      </div>

      <details><summary>Valabilitate și condiții de verificat</summary><p>{guide.note}</p><a href={guide.source} target="_blank" rel="noreferrer">Sursa consultată ↗</a></details>
      {trailer&&<p className="purchase-trailer">{trailerGuidance(s.country,vehicle)}</p>}
     </section>;})}
     {selections.some(s=>purchaseGuides[s.country].vin)&&<label htmlFor="vin">VIN / seria de șasiu necesară<input {...attrs('vin')} value={vin} maxLength={32} onChange={e=>setVin(e.target.value.toUpperCase())}/>{error('vin')}<small>Seria nestandard poate fi declarată la pasul Vehicul.</small></label>}
     <details className="purchase-technical"><summary>Date pentru încadrare din talon</summary><p>Necesar înainte de oferta finală: categoria, masele și, după țară, axele, emisiile și configurația ansamblului. Datele de aici nu produc un tarif.</p><div className="purchase-fields">{[['category','Categoria J'],['f1','Masa F.1 (kg)'],['f2','Masa F.2 (kg)'],['f3','Masa ansamblului F.3 (kg)'],['axles','Axe vehicul'],['seats','Locuri S.1'],['euro','Norma EURO'],['co2','Clasa CO₂'],...(trailer?[['trailer-f1','Remorcă F.1 (kg)'],['trailer-f2','Remorcă F.2 (kg)'],['trailer-axles','Axe remorcă']]:[])].map(([id,label])=><label key={id} htmlFor={'technical-'+id}>{label}<input id={'technical-'+id} value={technicalProfile[id]??''} maxLength={20} onChange={e=>setTechnicalProfile({...technicalProfile,[id]:e.target.value})}/></label>)}</div></details>
     {technical&&<section className="purchase-inset"><h3>Ruta pentru vehiculul greu</h3><div className="purchase-fields"><label htmlFor="route-from">De unde pleci?<input {...attrs('route-from')} value={route.from} onChange={e=>setRoute({...route,from:e.target.value})}/>{error('route-from')}</label><label htmlFor="route-to">Unde ajungi?<input id="route-to" value={route.to} onChange={e=>setRoute({...route,to:e.target.value})}/></label></div><label htmlFor="route-via">Puncte intermediare / autostrăzi<input id="route-via" value={route.via} onChange={e=>setRoute({...route,via:e.target.value})}/></label><p>Ruta este o cerere de verificare. Nu calculăm kilometri taxabili din distanța în linie dreaptă și nu confirmăm accesul pe drum.</p></section>}
    </>}
    {step===3&&<>
     <div className="purchase-plate"><span>{registration}</span><strong>{normalizePlate(plate)}</strong></div><p>{types.find(t=>t.id===vehicle)?.title}{vin?' · VIN: '+vin:''}</p>{trailer&&<p>Remorcă: {trailerCountry} · {normalizePlate(trailerPlate)}{trailerVin?' · '+trailerVin:''} — încadrare de verificat</p>}
     {technical&&<p>Ruta: {route.from} → {route.to}{route.via?' · prin '+route.via:''}</p>}
     <div className="purchase-review">{selections.map(s=><article key={s.country}><h3><Flag code={s.country}/>{countries.find(c=>c.code===s.country)!.name}</h3><p>{availableDurations(s.country,vehicle).find(o=>o.id===s.duration)?.label??'Taxă de verificat pe rută'}{s.duration==='annual'?' '+s.year:''} · {formatTravelDate(s.start)}{s.time?' '+s.time+' (ora locală)':''}</p><small>Valabilitatea finală, categoria și eventualele taxe separate se confirmă în oferta emitentului.</small>{trailer&&<p>{trailerGuidance(s.country,vehicle)}</p>}</article>)}</div>
     <label className="purchase-check"><input type="checkbox" checked={notify} onChange={e=>setNotify(e.target.checked)}/>Vreau să fiu notificat înainte de expirare (opțional; serviciu în pregătire)</label>
     <label className="purchase-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Am verificat numărul, seria de șasiu și selecțiile.</label>
     <div className="purchase-inset"><strong>Factura și documentele</strong><p>Comanda va putea avea o factură comună pentru pozițiile compatibile fiscal. Documentele și rapoartele vor fi disponibile în cont.</p></div>
    </>}
    <div className="purchase-actions">{step>1&&<button type="button" className="purchase-back" onClick={()=>go(step-1)}>← Înapoi</button>}{step<3?<button className="purchase-primary" type="submit">{step===1?'Alege țările':'Verifică selecția'}<ArrowRight size={19}/></button>:<button className="purchase-primary" type="button" disabled>{confirmed?'Plata se activează după oferta furnizorului':'Verifică și confirmă datele'}</button>}</div>
   </form><aside className="purchase-card purchase-summary"><span className="purchase-eyebrow">CĂLĂTORIA TA</span><h2>Totul într-un loc</h2><div className="purchase-summary-vehicle"><CarFront size={25}/><span>{plate?normalizePlate(plate):'Vehiculul tău'}<small>{types.find(t=>t.id===vehicle)?.title}</small></span></div>{selections.length===0?<p className="purchase-empty">Țările și perioadele alese vor apărea aici.</p>:selections.map(s=><div className="purchase-summary-line" key={s.country}><Flag code={s.country}/><div><strong>{countries.find(c=>c.code===s.country)!.name}</strong><small>{availableDurations(s.country,vehicle).find(o=>o.id===s.duration)?.label??'De selectat / verificat'}{s.duration==='annual'?' '+s.year:''}</small>{s.start&&<small><CalendarDays size={12}/> {formatTravelDate(s.start)}</small>}</div><span>—</span></div>)}<div className="purchase-total"><span>Total de plată</span><strong>În așteptarea ofertei</strong></div><p>Taxa emitentului, serviciul Vignexo și totalul vor fi afișate separat înainte de plată.</p><div className="purchase-trust"><ShieldCheck size={20}/><span>O sumă finală numai după verificarea tuturor produselor.</span></div><Link href="/flote/demo">Ai mai multe mașini? Vezi Vignexo Business →</Link></aside></div>
   <footer className="purchase-footer">Vinieta acoperă rețeaua și categoria produsului ales. Podurile, tunelurile, taxele kilometrice și restricțiile de circulație se verifică separat.</footer>
  </main>
 </div>;
}
