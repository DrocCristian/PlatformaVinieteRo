'use client';
import {useActionState} from 'react';
import {answerSupport} from '../app/(account)/cont/administrare/actions';
export function SupportAnswer({id,status,response}:{id:string;status:string;response:string|null}){
 const [state,action,pending]=useActionState(answerSupport,{});
 return <form action={action}><input name="id" type="hidden" value={id}/><label>Stare<select name="status" defaultValue={status}><option value="open">Deschisă</option><option value="reviewing">În analiză</option><option value="resolved">Rezolvată</option></select></label><label>Răspuns în cont<textarea name="response" required maxLength={4000} defaultValue={response??''}/></label>{state.error&&<p role="alert">{state.error}</p>}{state.success&&<p role="status">{state.success}</p>}<button className="primary" disabled={pending}>Salvează răspunsul</button></form>;
}
