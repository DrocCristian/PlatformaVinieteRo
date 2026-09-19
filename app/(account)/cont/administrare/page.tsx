import Link from 'next/link';
import {requireStaff} from '../../../../lib/staff';
import {SupportAnswer} from '../../../../components/support-answer';
export default async function Admin(){
 const {db,role}=await requireStaff(['superadmin','support','accounting']);
 const orders=await db.from('orders').select('id,status,total_minor,currency,created_at').order('created_at',{ascending:false}).limit(100);
 const support=role==='accounting'?null:await db.from('support_cases').select('id,subject,message,status,response').order('created_at',{ascending:false}).limit(100);
 return <><h1>Administrare Vignexo</h1><p>Rol: {role}. Sesiune verificată în doi pași.</p><section className="account-card"><h2>Comenzi de test</h2><Link href="/cont/administrare/export">Descarcă raportul CSV</Link>{orders.error?<p role="alert">Comenzile nu au putut fi încărcate.</p>:orders.data?.length?orders.data.map(o=><p key={o.id}>{o.id} · {o.status} · {o.total_minor/100} {o.currency}</p>):<p>Nicio comandă.</p>}</section>{support&&<section><h2>Solicitări de suport</h2>{support.error?<p role="alert">Solicitările nu au putut fi încărcate.</p>:support.data?.length?support.data.map(s=><article className="account-card" key={s.id}><h3>{s.subject}</h3><p className="preserve-lines">{s.message}</p><SupportAnswer id={s.id} status={s.status} response={s.response}/></article>):<p>Nicio solicitare.</p>}</section>}</>;
}
