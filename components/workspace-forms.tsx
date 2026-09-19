'use client';
import {useActionState,useState} from 'react';
import {saveJourney,createSupportCase,savePreferences} from '../app/(account)/cont/workspace-actions';
import type {ActionState} from '../packages/domain/account';
import {registrationCountries} from '../packages/domain/account';
import {countries} from '../packages/domain/countries';
function Feedback({state}:{state:ActionState}){return <>{state.error&&<p role="alert" className="account-error">{state.error}</p>}{state.success&&<p role="status" className="account-success">{state.success}</p>}</>;}
export function JourneyForm(){
 const [state,action,pending]=useActionState(saveJourney,{});
 const [selected,setSelected]=useState<string[]>(['RO']);
 const [periods,setPeriods]=useState<Record<string,{entry:string;exit:string}>>({});
 return <form action={action}><label htmlFor="trip-title">Numele călătoriei</label><input id="trip-title" name="title" required maxLength={80} placeholder="Vacanța de vară"/>
 <label htmlFor="trip-plate">Număr de înmatriculare</label><input id="trip-plate" name="plate" required maxLength={20}/>
 <label htmlFor="trip-registration">Țara de înmatriculare</label><select id="trip-registration" name="registration_country" defaultValue="RO">{registrationCountries.map(c=><option key={c}>{c}</option>)}</select>
 <fieldset className="workspace-fieldset"><legend>Țările călătoriei</legend><div className="workspace-choices">{countries.map(c=><label key={c.code}><input type="checkbox" checked={selected.includes(c.code)} onChange={e=>setSelected(s=>e.target.checked?[...s,c.code]:s.filter(x=>x!==c.code))}/>{c.name}</label>)}</div></fieldset>
 {countries.filter(c=>selected.includes(c.code)).map(c=><fieldset className="workspace-fieldset" key={c.code}><legend>{c.name}</legend><div className="date-pair"><label>Intrare în {c.name}<input type="date" required value={periods[c.code]?.entry??''} onChange={e=>setPeriods(p=>({...p,[c.code]:{entry:e.target.value,exit:p[c.code]?.exit??''}}))}/></label><label>Ieșire din {c.name}<input type="date" required value={periods[c.code]?.exit??''} onChange={e=>setPeriods(p=>({...p,[c.code]:{entry:p[c.code]?.entry??'',exit:e.target.value}}))}/></label></div></fieldset>)}
 <input type="hidden" name="destinations" value={JSON.stringify(selected.map(country=>({country,entry:periods[country]?.entry??'',exit:periods[country]?.exit??''})))}/>
 <p>Salvarea planului nu cumpără și nu activează viniete.</p><Feedback state={state}/><button className="primary" disabled={pending||!selected.length}>{pending?'Se salvează…':'Salvează călătoria'}</button></form>;
}
export function SupportForm(){
 const [state,action,pending]=useActionState(createSupportCase,{});
 return <form action={action}><label htmlFor="case-kind">Tipul solicitării</label><select id="case-kind" name="kind"><option value="general">Întrebare generală</option><option value="fine">Clarificare privind o amendă</option><option value="privacy">Date personale / ștergere cont</option></select>
 <label htmlFor="case-subject">Subiect</label><input id="case-subject" name="subject" required minLength={3} maxLength={120}/>
 <label htmlFor="case-message">Mesaj</label><textarea id="case-message" name="message" required minLength={10} maxLength={4000} rows={6}/>
 <label htmlFor="case-deadline">Termen relevant (opțional)</label><input id="case-deadline" name="deadline" type="date"/>
 <small>Nu include parole, date de card sau documente de identitate. Depunerea solicitării nu suspendă termenele legale și nu constituie reprezentare juridică.</small>
 <Feedback state={state}/><button className="primary" disabled={pending}>{pending?'Se înregistrează…':'Înregistrează solicitarea'}</button></form>;
}
export function PreferencesForm({email,language}:{email:boolean;language:string}){
 const [state,action,pending]=useActionState(savePreferences,{});
 return <form action={action}><label htmlFor="notification-language">Limba preferată pentru notificări</label><select id="notification-language" name="language" defaultValue={language}><option value="ro">Română</option><option value="en">English</option><option value="de">Deutsch</option></select>
 <label className="workspace-check"><input type="checkbox" name="expiration_email" defaultChecked={email}/>Doresc mementouri de expirare prin e-mail când serviciul va fi activ.</label>
 <p>Preferința poate fi retrasă oricând. Mesajele necesare comenzilor sunt separate de mementouri și de marketing. Marketingul nu este activ.</p>
 <Feedback state={state}/><button className="primary" disabled={pending}>{pending?'Se salvează…':'Salvează preferințele'}</button></form>;
}
