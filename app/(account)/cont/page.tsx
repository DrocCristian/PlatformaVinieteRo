import Link from 'next/link';
import {redirect} from 'next/navigation';
import {supabaseServer} from '../../../lib/supabase/server';
import {ProfileForm,VehicleForm} from '../../../components/account-forms';
import {archiveVehicle,signOut} from '../actions';
export default async function Account({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const db=await supabaseServer();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/autentificare');
 const [profile,vehicles]=await Promise.all([
 db.from('profiles').select('display_name').eq('id',user.id).maybeSingle(),
 db.from('vehicles').select('id,plate,registration_country,label,archived_at').eq('user_id',user.id).order('created_at',{ascending:false})]);
 const {notice}=await searchParams;
 const rows=vehicles.data ?? [];
 return <><div className="account-title"><div><span className="eyebrow">SPAȚIUL TĂU DE CĂLĂTORIE</span><h1>Contul meu</h1><p>{user.email}</p></div><form action={signOut}><button className="secondary">Deconectare</button></form></div>
 {(notice||profile.error||vehicles.error)&&<p role="alert" className="account-error">{notice==='logout-error'?'Deconectarea nu a reușit. Încearcă din nou.':'Unele date nu au putut fi încărcate sau salvate. Reîncearcă.'}</p>}
 <div className="account-grid"><section className="account-card"><h2>Profilul tău</h2>{!profile.error&&<ProfileForm name={profile.data?.display_name ?? ''}/>}<Link className="account-text-link" href="/cont/parola">Schimbă parola</Link></section>
 <section className="account-card"><h2>Adaugă un vehicul</h2><VehicleForm/></section>
 <section className="account-card account-vehicles"><h2>Vehiculele tale</h2>{!vehicles.error&&rows.length===0&&<p>Nu ai încă vehicule salvate. Adaugă primul vehicul pentru călătoriile următoare.</p>}
 {rows.map(v=><article className="saved-vehicle" key={v.id}><div><span className="saved-plate">{v.registration_country} · {v.plate}</span><p>{v.label||'Vehiculul meu'}{v.archived_at?' · Arhivat':''}</p></div><form action={archiveVehicle}><input type="hidden" name="id" value={v.id}/><input type="hidden" name="archive" value={v.archived_at?'no':'yes'}/><button className="secondary" aria-label={(v.archived_at?'Restaurează ':'Arhivează ')+v.plate}>{v.archived_at?'Restaurează':'Arhivează'}</button></form></article>)}
 <p className="account-note">Vehiculele arhivate rămân în cont și pot fi restaurate.</p></section></div></>;
}