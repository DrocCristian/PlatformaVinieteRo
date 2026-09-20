import Link from 'next/link';
import {z} from 'zod';
import {currentUser} from '../../lib/current-user';
import {purchaseContext} from '../../lib/purchase-context';
import {purchaseBasketSchema} from '../../packages/domain/purchase-workspace';
import {durationLabel} from '../../packages/i18n/purchase-labels';
import {countries} from '../../packages/domain/countries';
import PurchaseWorkspace from '../../components/purchase-workspace';
import './demo/style.css';
export const dynamic='force-dynamic';
export const metadata={title:'Vignexo — comanda ta',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{company?:string;vehicle?:string}>}){
 await currentUser();
 if(process.env.PURCHASE_WORKSPACE_ENABLED!=='true')return <main className="purchase-demo purchase-main"><h1>Pregătește vinietele</h1><p>Salvarea comenzilor este în curs de activare. Poți încerca formularul fără a cumpăra.</p><Link href="/cumpara/demo">Deschide demonstrația</Link> · <Link href="/cont">Contul meu</Link></main>;
 const query=await searchParams;
 if(query.company&&!z.uuid().safeParse(query.company).success)return <p role="alert">Firma nu este validă.</p>;
 const context=await purchaseContext(query.company??null);
 const draftQuery=context.db.from('purchase_drafts').select('id,title,created_at,snapshot').eq('user_id',context.user.id);
 const drafts=await (query.company?draftQuery.eq('company_id',query.company):draftQuery.is('company_id',null)).order('created_at',{ascending:false}).limit(20);
 return <><PurchaseWorkspace assets={context.assets} companyId={query.company??null} initialId={query.vehicle}/><section className="purchase-demo purchase-main"><h2>Comenzi salvate</h2>{drafts.error?<p role="alert">Ciornele nu au putut fi încărcate.</p>:!drafts.data?.length?<p>Nu ai comenzi salvate.</p>:drafts.data.filter(d=>d.snapshot?.companyId===(query.company??null)).map(d=>{const parsed=purchaseBasketSchema.safeParse(d.snapshot);return <details key={d.id}><summary>{d.title} · {d.created_at.slice(0,10)} · Ciornă</summary><p>Fără plată și fără viniete emise.</p>{parsed.success?parsed.data.entries.map((e,i)=>{const identity=z.object({plate:z.string().max(20),vin:z.string().max(32)}).safeParse(d.snapshot.entries[i]?.vehicle);return <article key={e.vehicleId}><h3>{identity.success?identity.data.plate:'Vehicul de verificat'}</h3>{identity.success&&<p>VIN: {identity.data.vin||'—'}</p>}{e.selections.map(s=><p key={s.country}>{countries.find(c=>c.code===s.country)?.name} · {durationLabel(s.duration,s.country==='BG'&&s.duration==='d1'?'24 de ore':'Verificare pe rută','ro')} · {s.start}{s.time?' '+s.time:''}{s.duration==='annual'?' · '+s.year:''}</p>)}{e.route.from&&<p>{e.route.from} → {e.route.to}</p>}<p>Notificare expirare: {e.notify?'Da':'Nu'}</p></article>}):<p>Datele ciornei necesită verificare.</p>}</details>})}</section></>;
}
