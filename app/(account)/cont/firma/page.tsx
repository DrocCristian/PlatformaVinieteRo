import Link from 'next/link';
import {currentUser} from '../../../../lib/current-user';
import {CompanyForm,FleetAssetForm,FleetBatchForm} from '../../../../components/fleet-forms';
import {assetKinds,type FleetAsset} from '../../../../packages/domain/fleet';
export default async function CompanyPage({searchParams}:{searchParams:Promise<{company?:string}>}){
 const {db,user}=await currentUser();
 if(process.env.FLEET_WORKSPACE_ENABLED!=='true')return <section className="account-card"><h1>Firma și flota</h1><p>Pregătim spațiul pentru comenzi comune și documentele flotei.</p><Link className="account-text-link" href="/flote/demo">Vezi demonstrația</Link></section>;
 const companies=await db.from('fleet_companies').select('id,name,tax_id,country,billing_address,billing_email').eq('owner_id',user.id).order('created_at');
 if(companies.error)return <p role="alert" className="account-error">Datele firmelor nu au putut fi încărcate.</p>;
 const query=await searchParams;
 const company=(companies.data??[]).find(c=>c.id===query.company)??companies.data?.[0];
 const [assets,drafts,documents]=company?await Promise.all([
 db.from('fleet_assets').select('id,company_id,plate,registration_country,label,kind,identity,f1,f2,f3,axles,euro,co2_class').eq('company_id',company.id).is('archived_at',null).order('created_at').limit(101),
 db.from('fleet_purchase_drafts').select('id,title,created_at').eq('company_id',company.id).order('created_at',{ascending:false}).limit(20),
 db.from('fleet_documents').select('id,reference,kind,issued_on,efactura_status').eq('company_id',company.id).order('issued_on',{ascending:false}).limit(20)
 ]):[null,null,null];
 const rows=(assets?.data??[]) as FleetAsset[];
 return <><div className="account-title"><div><span className="eyebrow">VIGNEXO PENTRU FIRME</span><h1>O flotă. Un singur loc.</h1><p>Vehicule, comenzi comune și documente pentru contabilitate.</p></div></div>
 <nav className="workspace-links" aria-label="Firme">{companies.data?.map(c=><Link key={c.id} className="secondary" href={'/cont/firma?company='+c.id}>{c.name}</Link>)}</nav>
 {(assets?.error||drafts?.error||documents?.error)&&<p role="alert" className="account-error">Unele date nu au putut fi încărcate. Reîncearcă.</p>}
 <div className="account-grid"><section className="account-card"><h2>{company?'Datele firmei':'Adaugă firma'}</h2><CompanyForm key={company?.id??'new'} company={company}/>{company&&<details><summary>Adaugă altă firmă</summary><CompanyForm/></details>}</section>
 {company&&<section className="account-card"><h2>Adaugă un vehicul</h2><FleetAssetForm key={company.id} companyId={company.id}/></section>}
 {company&&!assets?.error&&<section className="account-card account-vehicles"><h2>Flota firmei</h2>{rows.length===0?<p>Flota este goală. Poți adăuga autoturisme, camioane, capete tractor și remorci.</p>:<div className="workspace-scroll"><table className="workspace-table"><thead><tr><th>Înmatriculare</th><th>Tip</th><th>Denumire</th></tr></thead><tbody>{rows.map(v=><tr key={v.id}><td>{v.registration_country} · {v.plate}</td><td>{assetKinds[v.kind]}</td><td>{v.label||'—'}<details><summary>Editează VIN și datele tehnice</summary><FleetAssetForm companyId={company.id} asset={v}/></details></td></tr>)}</tbody></table></div>}</section>}
 {company&&!assets?.error&&<section className="account-card account-vehicles"><h2>Cumpără pentru mai multe vehicule</h2><Link className="primary" href={'/cumpara?company='+company.id}>Alege durate pentru fiecare vehicul</Link>{rows.length>100?<p role="alert">Această versiune acceptă până la 100 de vehicule afișate; pentru flote mai mari este necesară paginarea.</p>:<FleetBatchForm key={company.id} companyId={company.id} assets={rows}/>}</section>}
 {company&&<section className="account-card"><h2>Comenzi pregătite</h2><p>Ultimele 20 de ciorne. Nicio ciornă nu reprezintă o plată sau o vinietă emisă.</p>{drafts?.data?.map(d=><p key={d.id}>{d.title} · Ciornă</p>)}</section>}
 {company&&<section className="account-card"><h2>Facturi și rapoarte</h2><p>Facturile emise rămân în cont. Rapoartele pot reuni toate mașinile și orice interval, fără refacturarea achizițiilor.</p>
 {!documents?.data?.length&&<p>Nu există încă documente emise.</p>}
 {documents?.data?.map(d=><p key={d.id}>{d.reference} · {d.issued_on} · {d.kind}</p>)}
 <form action="/cont/firma/raport" method="get"><input type="hidden" name="companyId" value={company.id}/><div className="date-pair"><label>De la<input name="from" type="date" required/></label><label>Până la<input name="to" type="date" required/></label></div>
 <label>Vehicul<select name="vehicle"><option value="">Întreaga flotă</option>{rows.map(v=><option value={v.id} key={v.id}>{v.plate}</option>)}</select></label>
 <input type="hidden" name="groupBy" value="vehicle"/><button className="secondary">Descarcă raport CSV</button></form></section>}</div></>;
}
