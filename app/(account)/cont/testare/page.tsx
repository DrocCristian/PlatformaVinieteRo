import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {currentUser} from '../../../../lib/current-user';
import {commerceConfigured} from '../../../../lib/supabase/admin';
import {createTestCheckout} from './actions';
export default async function Sandbox({searchParams}:{searchParams:Promise<{error?:string;reference?:string}>}){
 await currentUser();const {error,reference}=await searchParams;const support=z.uuid().safeParse(reference);
 return <><h1>Testarea plății</h1><p className="account-banner">Exclusiv Stripe test. Două produse fictive de câte 1 EUR, fără valoare de vinietă. Nu folosi datele unui card real.</p>{error&&<p role="alert">Testul nu a putut fi pornit. Verifică datele sau reîncearcă mai târziu.{support.success&&<> Cod suport: <code>{support.data}</code></>}</p>}{!commerceConfigured()?<p>Conexiunea Stripe de test și procesarea simulărilor nu sunt încă activate.</p>:<form className="account-card" action={createTestCheckout}><input type="hidden" name="id" value={randomUUID()}/><label>Număr auto fictiv<input name="plate" defaultValue="B123ABC" required maxLength={12}/></label><label>Răspuns simulat pentru Austria<select name="scenario"><option value="success">Emitere reușită</option><option value="refusal">Refuz</option><option value="timeout">Răspuns incert</option></select></label><label><input name="consent" type="checkbox" required/> Înțeleg că este o simulare și nu cumpăr viniete.</label><button className="primary">Continuă în Stripe test</button></form>}</>;
}
