import Link from 'next/link';
import {currentUser} from '../../../../lib/current-user';
import {commerceConfigured} from '../../../../lib/supabase/admin';
const labels:Record<string,string>={awaiting_payment:'Așteaptă plata de test',paid:'Plată de test confirmată',issuing:'Simulare în curs',issued:'Simulare finalizată',partial:'Simulare parțială',manual_review:'Necesită verificare',failed:'Simulare refuzată',refunded:'Rambursat în test'};
export default async function Orders(){
 const {db,user}=await currentUser();
 const result=await db.from('orders').select('id,status,currency,total_minor,created_at,order_items(id,country,status,provider_reference)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);
 return <><h1>Comenzile mele</h1><p className="account-banner">Platforma este în pregătire. Comenzile de test nu conferă drept de circulație și nu emit viniete oficiale.</p>
 {commerceConfigured()&&<Link className="account-text-link" href="/cont/testare">Deschide testarea plății</Link>}
 {result.error?<p role="alert">Comenzile nu au putut fi încărcate.</p>:!result.data?.length?<p>Nu ai încă nicio comandă.</p>:result.data.map(o=><article className="account-card" key={o.id}><h2>Comandă de test</h2><p>{labels[o.status]??o.status} · {new Intl.NumberFormat('ro-RO',{style:'currency',currency:o.currency}).format(o.total_minor/100)}</p><p className="account-note">{o.id}</p>{o.order_items.map(i=><p key={i.id}>{i.country} · {i.status==='issued'?'Document de simulare disponibil':i.status}{i.status==='issued'&&<> · <Link href={'/cont/comenzi/document/'+i.id}>Descarcă simularea</Link></>}</p>)}</article>)}</>;
}
