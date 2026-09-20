'use client';
import {useActionState,useState} from 'react';
import Link from 'next/link';
import {saveRouteJourney} from '../app/(account)/cont/workspace-actions';
import RouteFields,{emptyRoute} from './route-fields';
import {readTechnical,kindLabels} from '../packages/domain/vehicle-profile';
export type SavedRouteVehicle={id:string;plate:string;registration_country:string;label:string;technical:unknown};
export default function RouteJourneyForm({vehicles,initialId}:{vehicles:SavedRouteVehicle[];initialId?:string}){
 const [id,setId]=useState(()=>vehicles.find(v=>v.id===initialId)?.id??vehicles[0]?.id??'');
 const [route,setRoute]=useState(emptyRoute);
 const [state,action,pending]=useActionState(saveRouteJourney,{});
 const vehicle=vehicles.find(v=>v.id===id);
 const technical=readTechnical(vehicle?.technical);
 if(!vehicles.length)return <p>Adaugă mai întâi vehiculul în <Link href="/cont">contul tău</Link>. Îl vei putea folosi la fiecare cursă.</p>;
 return <form action={action}><label htmlFor="route-vehicle">Cu ce vehicul pleci?</label><select id="route-vehicle" name="vehicle_id" value={id} onChange={e=>setId(e.target.value)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.plate} · {v.label||v.registration_country}</option>)}</select>
 <p>{technical?kindLabels[technical.kind]+' · '+(technical.f1??'—')+' kg'+(technical.trailer?' · remorcă '+technical.trailer.plate:''):'Completează datele din talon pentru acest vehicul.'} <Link href="/cont">Editează vehiculul</Link></p>
 <RouteFields value={route} onChange={setRoute}/>
 <p>Țările de tranzit și taxele vor fi determinate după conectarea serviciului de rutare. Poți salva cursa acum.</p>
 {state.error&&<p className="account-error" role="alert">{state.error}{state.reference&&<><br/><span>Cod suport: <code>{state.reference}</code></span></>}</p>}{state.success&&<p className="account-success" role="status">{state.success}</p>}
 <button className="primary" disabled={pending}>{pending?'Se salvează…':'Salvează cursa'}</button>
 </form>;
}
