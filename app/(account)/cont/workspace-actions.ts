'use server';
import {routeRequestSchema} from '../../../packages/domain/route-request';
import {readTechnical} from '../../../packages/domain/vehicle-profile';
import {revalidatePath} from 'next/cache';
import {redirect,unstable_rethrow} from 'next/navigation';
import {z} from 'zod';
import {currentUser} from '../../../lib/current-user';
import {startOperation} from '../../../lib/observability';
import {journeySchema,supportSchema} from '../../../packages/domain/workspace';
import type {ActionState} from '../../../packages/domain/account';
type Trace=ReturnType<typeof startOperation>;
function invalid(trace:Trace,error:string):ActionState{trace.finish('invalid','validation_failed');return {error};}
function failed(trace:Trace,message:string,code:Parameters<Trace['finish']>[1],error?:unknown):ActionState{
 trace.finish('error',code,{error});return {error:message,reference:trace.requestId};
}
export async function saveJourney(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('journey.save');
 let destinations:unknown;
 try{destinations=JSON.parse(String(data.get('destinations')??''));}catch{return invalid(trace,'Verifică țările și perioadele.');}
 const parsed=journeySchema.safeParse({...Object.fromEntries(data),destinations});
 if(!parsed.success)return invalid(trace,parsed.error.issues[0].message);
 try{
  const {db,user}=await currentUser();
  const {error}=await db.from('journeys').insert({...parsed.data,user_id:user.id});
  if(error)return failed(trace,'Călătoria nu a putut fi salvată. Reîncearcă mai târziu.','persistence_failed',error);
  revalidatePath('/cont/calatorii');
 }catch(error){unstable_rethrow(error);return failed(trace,'Călătoria nu a putut fi salvată. Reîncearcă mai târziu.','unexpected_error',error);}
 trace.finish('success','completed');
 return {success:'Călătoria a fost salvată în cont. Nu reprezintă o vinietă sau o comandă.'};
}
export async function archiveJourney(data:FormData){
 const trace=startOperation('journey.archive');
 const id=z.uuid().safeParse(data.get('id'));
 try{
  const {db,user}=await currentUser();
  if(!id.success){trace.finish('invalid','validation_failed');redirect('/cont/calatorii?error=1');}
  const {data:rows,error}=await db.from('journeys').update({archived_at:data.get('archive')==='no'?null:new Date().toISOString()}).eq('id',id.data).eq('user_id',user.id).select('id');
  if(error||!rows?.length){trace.finish('error',error?'persistence_failed':'not_found',{error});redirect('/cont/calatorii?error=1');}
  revalidatePath('/cont/calatorii');
 }catch(error){unstable_rethrow(error);trace.finish('error','unexpected_error',{error});throw error;}
 trace.finish('success','completed');
}
export async function createSupportCase(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('support.create');
 const parsed=supportSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return invalid(trace,parsed.error.issues[0].message);
 try{
  const {db,user}=await currentUser();
  const {error}=await db.from('support_cases').insert({...parsed.data,user_id:user.id});
  if(error)return failed(trace,'Solicitarea nu a putut fi salvată. Reîncearcă mai târziu.','persistence_failed',error);
  revalidatePath('/cont/suport');
 }catch(error){unstable_rethrow(error);return failed(trace,'Solicitarea nu a putut fi salvată. Reîncearcă mai târziu.','unexpected_error',error);}
 trace.finish('success','completed');return {success:'Solicitarea a fost înregistrată. O poți urmări în cont. Confirmarea prin e-mail nu este încă activă.'};
}
export async function savePreferences(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('preferences.save');
 const language=z.enum(['ro','en','de']).safeParse(data.get('language'));
 if(!language.success)return invalid(trace,'Selectează limba.');
 try{
  const {db,user}=await currentUser();
  const values={expiration_email:data.get('expiration_email')==='on',language:language.data};
  const existing=await db.from('notification_preferences').select('user_id').eq('user_id',user.id).maybeSingle();
  if(existing.error)return failed(trace,'Preferințele nu au putut fi citite.','upstream_unavailable',existing.error);
  const {error}=existing.data?await db.from('notification_preferences').update(values).eq('user_id',user.id):await db.from('notification_preferences').insert({...values,user_id:user.id});
  if(error)return failed(trace,'Preferințele nu au putut fi salvate.','persistence_failed',error);
  revalidatePath('/cont/notificari');
 }catch(error){unstable_rethrow(error);return failed(trace,'Preferințele nu au putut fi salvate.','unexpected_error',error);}
 trace.finish('success','completed');return {success:'Preferințele au fost salvate. Trimiterea notificărilor va fi disponibilă după activarea serviciului.'};
}
export async function saveRouteJourney(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('route.save');
 const id=z.uuid().safeParse(data.get('vehicle_id'));
 const route=routeRequestSchema.safeParse(Object.fromEntries(data));
 if(!id.success)return invalid(trace,'Alege un vehicul salvat.');
 if(!route.success)return invalid(trace,route.error.issues[0].message);
 try{
  const {db,user}=await currentUser();
  const {data:vehicle,error:readError}=await db.from('vehicles').select('plate,registration_country,technical').eq('id',id.data).eq('user_id',user.id).is('archived_at',null).maybeSingle();
  if(readError||!vehicle)return failed(trace,'Vehiculul nu este disponibil în contul tău.',readError?'upstream_unavailable':'not_found',readError);
  const technical=readTechnical(vehicle.technical);
  const {error}=await db.from('journeys').insert({
   user_id:user.id,title:(route.data.origin+' → '+route.data.destination).slice(0,80),
   plate:vehicle.plate,registration_country:vehicle.registration_country,destinations:[],
   route_request:route.data,vehicle_snapshot:{...vehicle,technical}
  });
  if(error)return failed(trace,'Cursa nu a putut fi salvată. Reîncearcă.','persistence_failed',error);
  revalidatePath('/cont/calatorii');
 }catch(error){unstable_rethrow(error);return failed(trace,'Cursa nu a putut fi salvată. Reîncearcă.','unexpected_error',error);}
 trace.finish('success','completed');
 return {success:'Cursa a fost salvată. Totalul va putea fi calculat după activarea rutării și tarifelor; nu s-a efectuat nicio plată.'};
}
