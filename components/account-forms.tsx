'use client';
import {useActionState,useState} from 'react';
import Link from 'next/link';
import VehicleDetails from './vehicle-details';
import {emptyTechnical,readTechnical} from '../packages/domain/vehicle-profile';
import {signIn,signUp,recoverPassword,saveProfile,addVehicle,changePassword} from '../app/(account)/actions';
import {registrationCountries} from '../packages/domain/account';
import type {ActionState} from '../packages/domain/account';
function Feedback({state}:{state:ActionState}){
 return <>{state.error&&<p role="alert" className="account-error">{state.error}{state.reference&&<><br/><span>Cod suport: <code>{state.reference}</code></span></>}</p>}{state.success&&<p role="status" className="account-success">{state.success}</p>}</>;
}
export function AuthForm({mode}:{mode:'login'|'signup'|'recover'}){
 const [state,action,pending]=useActionState(mode==='login'?signIn:mode==='signup'?signUp:recoverPassword,{});
 const title=mode==='login'?'Bine ai revenit':mode==='signup'?'Creează contul tău':'Recuperează accesul';
 return <section className="account-card auth-card"><span className="eyebrow">CĂLĂTORII FĂRĂ GRIJI</span><h1>{title}</h1><p>{mode==='recover'?'Îți trimitem instrucțiunile pe e-mail.':'Salvează vehiculele și pregătește următoarea călătorie.'}</p><form action={action}>
 <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254}/>
 {mode!=='recover'&&<><label htmlFor="password">Parolă</label><input id="password" name="password" type="password" minLength={8} maxLength={128} autoComplete={mode==='login'?'current-password':'new-password'} required/>{mode==='signup'&&<small>Cel puțin 8 caractere. Folosește o parolă unică.</small>}</>}
 <Feedback state={state}/><button className="primary" disabled={pending}>{pending?'Se procesează…':mode==='login'?'Intră în cont':mode==='signup'?'Creează cont':'Trimite instrucțiunile'}</button></form>
 <div className="account-links">{mode==='login'?<><Link href="/inregistrare">Nu ai cont? Înregistrează-te</Link><Link href="/recuperare">Ai uitat parola?</Link></>:<Link href="/autentificare">Înapoi la autentificare</Link>}</div></section>;
}
export function ProfileForm({name}:{name:string}){
 const [state,action,pending]=useActionState(saveProfile,{});
 return <form action={action}><label htmlFor="display_name">Cum te numești?</label><input id="display_name" name="display_name" defaultValue={name} maxLength={80} autoComplete="name"/><Feedback state={state}/><button className="secondary" disabled={pending}>{pending?'Se salvează…':'Salvează profilul'}</button></form>;
}
export function VehicleForm({vehicle}:{vehicle?:{id:string;plate:string;registration_country:string;label:string;technical:unknown}}){
 const [technical,setTechnical]=useState(()=>readTechnical(vehicle?.technical)??emptyTechnical());
 const [state,action,pending]=useActionState(addVehicle,{});
 return <form action={action}><input type="hidden" name="id" value={vehicle?.id??''}/><label htmlFor={'saved-plate-'+(vehicle?.id??'new')}>Număr de înmatriculare</label><input id={'saved-plate-'+(vehicle?.id??'new')} name="plate" defaultValue={vehicle?.plate??''} placeholder="B 123 ABC" required maxLength={20} autoComplete="off"/>
 <label htmlFor={'saved-country-'+(vehicle?.id??'new')}>Țara de înmatriculare</label><select id={'saved-country-'+(vehicle?.id??'new')} name="registration_country" defaultValue={vehicle?.registration_country??'RO'}>{registrationCountries.map(c=><option key={c}>{c}</option>)}</select>
 <label htmlFor={'vehicle-label-'+(vehicle?.id??'new')}>Denumire (opțional)</label><input id={'vehicle-label-'+(vehicle?.id??'new')} name="label" defaultValue={vehicle?.label??''} placeholder="Mașina familiei" maxLength={60}/>
 <label>VIN / seria de șasiu<input value={technical.identity?.vin??''} maxLength={32} onChange={e=>setTechnical({...technical,identity:{vin:e.target.value.toUpperCase(),legacyVin:technical.identity?.legacyVin??false}})}/></label><label className="workspace-check"><input type="checkbox" checked={technical.identity?.legacyVin??false} onChange={e=>setTechnical({...technical,identity:{vin:technical.identity?.vin??'',legacyVin:e.target.checked}})}/>Serie nestandard pentru vehicul vechi</label>{technical.trailer&&<><label>VIN remorcă (opțional)<input value={technical.trailer.identity?.vin??''} maxLength={32} onChange={e=>setTechnical({...technical,trailer:technical.trailer?{...technical.trailer,identity:{vin:e.target.value.toUpperCase(),legacyVin:technical.trailer.identity?.legacyVin??false}}:null})}/></label><label className="workspace-check"><input type="checkbox" checked={technical.trailer.identity?.legacyVin??false} onChange={e=>setTechnical({...technical,trailer:technical.trailer?{...technical.trailer,identity:{vin:technical.trailer.identity?.vin??'',legacyVin:e.target.checked}}:null})}/>Serie nestandard remorcă</label></>}<VehicleDetails value={technical} onChange={setTechnical}/><small>Salvarea nu confirmă eligibilitatea pentru o vinietă. Categoria și regulile se vor verifica înainte de achiziție.</small><Feedback state={state}/><button className="primary" disabled={pending}>{pending?'Se salvează…':'Salvează vehiculul'}</button></form>;
}
export function PasswordForm(){
 const [state,action,pending]=useActionState(changePassword,{});
 return <form action={action}><label htmlFor="new-password">Parola nouă</label><input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/><label htmlFor="confirmation">Repetă parola</label><input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128}/><Feedback state={state}/><button className="primary" disabled={pending}>{pending?'Se actualizează…':'Actualizează parola'}</button></form>;
}
