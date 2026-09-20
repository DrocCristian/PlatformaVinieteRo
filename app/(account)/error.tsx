'use client';
import {safeDigest} from '../../packages/domain/telemetry';
export default function AccountError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
 const digest=safeDigest(error.digest);
 return <section className="account-card auth-card"><h1>Conexiunea a fost întreruptă</h1><p>Nu am putut încărca această pagină. Datele salvate rămân în cont.</p>{digest&&<p>Cod suport: <code>{digest}</code></p>}<button className="primary" onClick={reset}>Încearcă din nou</button></section>;
}
