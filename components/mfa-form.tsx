'use client';
import {useActionState,useState} from 'react';
import {enrollMfa,verifyMfa,type MfaState} from '../app/(account)/cont/securitate/actions';
export function MfaForm({verifiedFactor}:{verifiedFactor?:string}){
 const [setup,setSetup]=useState<MfaState>({});const [busy,setBusy]=useState(false);
 const [state,action,pending]=useActionState(verifyMfa,{});
 const factor=verifiedFactor??setup.factorId;
 return <section className="account-card"><h2>Aplicație de autentificare</h2>{!factor&&<button className="primary" disabled={busy} onClick={async()=>{setBusy(true);try{setSetup(await enrollMfa());}finally{setBusy(false);}}}>Configurează autentificatorul</button>}{setup.error&&<p role="alert">{setup.error}</p>}{setup.secret&&!state.success&&<><p>Adaugă manual această cheie în aplicația ta de autentificare. Păstreaz-o confidențială.</p><code>{setup.secret}</code></>}{factor&&<form action={action}><input type="hidden" name="factorId" value={factor}/><label>Cod de securitate<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label><button className="primary" disabled={pending}>Verifică sesiunea</button></form>}{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}</section>;
}
