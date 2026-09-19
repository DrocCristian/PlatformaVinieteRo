import RouteJourneyForm from '../../../../components/route-journey-form';
import {routeRecordSchema} from '../../../../packages/domain/route-request';
import {currentUser} from '../../../../lib/current-user';
import {JourneyForm} from '../../../../components/workspace-forms';
import {archiveJourney} from '../workspace-actions';
import {destinationsSchema} from '../../../../packages/domain/workspace';
import {countries} from '../../../../packages/domain/countries';
import {formatTravelDate} from '../../../../packages/domain/catalog';
export default async function Journeys({searchParams}:{searchParams:Promise<{error?:string;vehicle?:string}>}){
 const {db,user}=await currentUser();const {data,error}=await db.from('journeys').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);
 const query=await searchParams;
 const vehicles=await db.from('vehicles').select('id,plate,registration_country,label,technical').eq('user_id',user.id).is('archived_at',null).order('created_at',{ascending:false});
 return <><h1>Călătoriile mele</h1><p>Pregătește traseul și păstrează perioadele pentru fiecare țară.</p>{(error||query.error)&&<p role="alert" className="account-error">Călătoriile nu au putut fi încărcate sau actualizate.</p>}
 <div className="account-grid"><section className="account-card"><h2>O nouă călătorie</h2>{vehicles.error?<p role="alert">Vehiculele nu au putut fi încărcate.</p>:<RouteJourneyForm vehicles={vehicles.data??[]} initialId={query.vehicle}/>}<details><summary>Planificare manuală pe țări</summary><JourneyForm/></details></section><section className="account-card"><h2>Planuri salvate</h2>{!error&&!data?.length&&<p>Nu ai încă planuri salvate.</p>}{data?.map(j=>{const parsed=destinationsSchema.safeParse(j.destinations);const route=routeRecordSchema.safeParse(j.route_request);return <article className="workspace-item" key={j.id}><h3>{j.title}{j.archived_at?' · Arhivat':''}</h3><p>{j.registration_country} · {j.plate}</p>{route.success?<><p>{route.data.origin} → {route.data.destination}</p><p>{formatTravelDate(route.data.departure)} – {formatTravelDate(route.data.returnDate)}</p><p>Total: indisponibil · traseu încă necalculat</p></>:parsed.success?parsed.data.map(d=><p key={d.country}>{countries.find(c=>c.code===d.country)?.name}: {formatTravelDate(d.entry)} – {formatTravelDate(d.exit)}</p>):<p>Datele planului trebuie verificate.</p>}<small>Plan de călătorie · fără viniete emise</small><form action={archiveJourney}><input type="hidden" name="id" value={j.id}/><input type="hidden" name="archive" value={j.archived_at?'no':'yes'}/><button className="secondary">{j.archived_at?'Restaurează':'Arhivează'}</button></form></article>;})}</section></div></>;
}
