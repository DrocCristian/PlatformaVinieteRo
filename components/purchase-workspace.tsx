'use client';
import {useActionState,useState} from 'react';
import Link from 'next/link';
import PurchaseDemo from './purchase-demo';
import {savePurchaseBasket} from '../app/cumpara/actions';
import {snapshotPurchaseBasket} from '../packages/domain/purchase-workspace';
import {localToday} from '../packages/domain/catalog';
import type {SavedPurchaseVehicle,PurchaseBasket,PreparedPurchase} from '../packages/domain/purchase-workspace';
import {countries} from '../packages/domain/countries';
import {availableDurations} from '../packages/domain/purchase-preview';
export default function PurchaseWorkspace({assets,companyId,initialId,demo=false}:{assets:SavedPurchaseVehicle[];companyId:string|null;initialId?:string;demo?:boolean}){
 const motors=assets.filter(v=>!['trailer','semitrailer'].includes(v.kind));
 const [id,setId]=useState(motors.find(v=>v.id===initialId)?.id??motors[0]?.id??'');
 const [trailerId,setTrailerId]=useState('');
 const [entries,setEntries]=useState<PurchaseBasket['entries']>([]);
 const [title,setTitle]=useState('Comandă de viniete');
 const [state,action,pending]=useActionState(savePurchaseBasket,{});
 const [demoSaved,setDemoSaved]=useState(false);
 const [validation,setValidation]=useState('');
 const vehicle=motors.find(v=>v.id===id),trailer=assets.find(v=>v.id===trailerId);
 const saved=vehicle?{...vehicle,trailer:trailer?{id:trailer.id,plate:trailer.plate,country:trailer.registration,vin:trailer.vin,legacyVin:trailer.legacyVin,technical:trailer.technical}:vehicle.trailer}:undefined;
 function add(draft:PreparedPurchase){
  setEntries(old=>[...old.filter(e=>e.vehicleId!==id),{vehicleId:id,trailerId:trailerId||null,selections:draft.selections,route:draft.route,notify:draft.notify}]);setDemoSaved(false);setValidation('');requestAnimationFrame(()=>document.getElementById('purchase-basket')?.scrollIntoView({behavior:'smooth'}));
 }
 return <><section className="purchase-demo purchase-main"><h1>{companyId?'Comanda firmei':'Comanda ta'}</h1><p>Selectează vehiculul salvat, alege produsele și adaugă-l în comanda comună. Repetă pentru celelalte vehicule.</p>{demo&&<p role="note">Date fictive. Salvarea demonstrației durează doar până la reîncărcare.</p>}
 <div className="purchase-card"><label>Vehicul salvat<select value={id} onChange={e=>{setId(e.target.value);setTrailerId('');}}>{motors.map(v=><option key={v.id} value={v.id}>{v.plate} · {v.label}</option>)}</select></label>{companyId&&<label>Remorcă / semiremorcă<select value={trailerId} onChange={e=>setTrailerId(e.target.value)}><option value="">Fără remorcă</option>{assets.filter(v=>v.kind===(vehicle?.kind==='tractor'?'semitrailer':'trailer')).map(v=><option key={v.id} value={v.id}>{v.plate}</option>)}</select></label>}<Link href={companyId?'/cont/firma':'/cont'}>Administrează vehiculele și VIN-ul</Link></div></section>
 {saved?<PurchaseDemo key={id+':'+trailerId} saved={saved} onPrepare={add}/>:<p>Adaugă mai întâi un vehicul în cont.</p>}
 <section className="purchase-demo purchase-main"><div className="purchase-card"><h2 id="purchase-basket">Comanda comună · {entries.length} vehicule</h2>{entries.map(e=>{const v=assets.find(v=>v.id===e.vehicleId)!;return <article key={e.vehicleId}><h3>{v.plate}</h3>{e.selections.map(s=><p key={s.country}>{countries.find(c=>c.code===s.country)?.name} · {availableDurations(s.country,v.vehicle).find(d=>d.id===s.duration)?.label??'Verificare pe rută'} · {s.start}{s.time?' '+s.time:''}</p>)}<p>Notificare expirare: {e.notify?'Da':'Nu'}</p><button className="purchase-back" type="button" onClick={()=>{setEntries(old=>old.filter(x=>x.vehicleId!==e.vehicleId));setDemoSaved(false);}}>Elimină {v.plate}</button></article>;})}
 <p><strong>Total: în așteptarea ofertelor furnizorilor.</strong></p><form action={demo?undefined:action} onSubmit={e=>{try{snapshotPurchaseBasket({companyId,title,entries},assets,localToday());setValidation('');if(demo){e.preventDefault();setDemoSaved(true);}}catch(error){e.preventDefault();setValidation(error instanceof Error?error.message:'Verifică datele.');}}}><label>Numele comenzii<input value={title} minLength={2} maxLength={100} required onChange={e=>setTitle(e.target.value)}/></label><input name="basket" type="hidden" value={JSON.stringify({companyId,title,entries})}/>{validation&&<p role="alert">{validation}</p>}{state.error&&<p role="alert">{state.error}</p>}{(state.success||demoSaved)&&<p role="status">{demo?'Ciornă demonstrativă pregătită. Nu s-au salvat date pe server.':state.success}</p>}<button className="purchase-primary" disabled={pending||!entries.length||!!state.success}>{pending?'Se salvează…':'Salvează comanda comună'}</button></form><p>Salvarea nu activează plata, facturarea sau vinietele.</p></div></section></>;
}
