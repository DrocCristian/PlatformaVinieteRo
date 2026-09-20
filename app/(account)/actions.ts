'use server';
import {redirect,unstable_rethrow} from 'next/navigation';
import {technicalSchema} from '../../packages/domain/vehicle-profile';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {supabaseServer} from '../../lib/supabase/server';
import {currentUser,isAuthUpstreamFailure} from '../../lib/current-user';
import {startOperation} from '../../lib/observability';
import {credentialsSchema,vehicleSchema,type ActionState} from '../../packages/domain/account';
const unavailable='Serviciul nu este disponibil momentan. Încearcă din nou.';
const appUrl=()=>process.env.APP_URL ?? 'http://127.0.0.1:3000';
type Trace=ReturnType<typeof startOperation>;
function invalid(trace:Trace,error:string):ActionState{trace.finish('invalid','validation_failed');return {error};}
function failed(trace:Trace,message:string,code:Parameters<Trace['finish']>[1],error?:unknown):ActionState{
 trace.finish('error',code,{error});return {error:message,reference:trace.requestId};
}
export async function signIn(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('auth.sign_in');
 const parsed=credentialsSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return invalid(trace,parsed.error.issues[0].message);
 try{
  const db=await supabaseServer();
  const {error}=await db.auth.signInWithPassword(parsed.data);
  if(error){const upstream=isAuthUpstreamFailure(error);trace.finish(upstream?'error':'denied',upstream?'upstream_unavailable':'authentication_failed',{error});return {error:'Autentificarea nu a reușit. Verifică e-mailul, parola și confirmarea adresei.',reference:trace.requestId};}
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'upstream_unavailable',error);}
 trace.finish('success','completed');
 redirect('/cont');
}
export async function signUp(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('auth.sign_up');
 const parsed=credentialsSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return invalid(trace,parsed.error.issues[0].message);
 let signedIn=false;
 try{
  const db=await supabaseServer();
  const {data:result,error}=await db.auth.signUp({...parsed.data,options:{emailRedirectTo:appUrl()+'/auth/callback'}});
  if(error)return failed(trace,error.status===429?'Prea multe încercări. Așteaptă înainte de a încerca din nou.':'Contul nu a putut fi creat. Încearcă mai târziu sau autentifică-te dacă ai deja cont.','authentication_failed',error);
  signedIn=!!result.session;
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'upstream_unavailable',error);}
 trace.finish(signedIn?'success':'pending',signedIn?'completed':'confirmation_pending');
 if(signedIn)redirect('/cont');
 return {success:'Verifică e-mailul pentru confirmarea contului. Dacă ai deja un cont, folosește autentificarea.'};
}
export async function recoverPassword(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('auth.recover');
 const parsed=z.email().max(254).safeParse(data.get('email'));
 if(!parsed.success)return invalid(trace,'Introdu o adresă de e-mail validă.');
 try{
  const db=await supabaseServer();
  const {error}=await db.auth.resetPasswordForEmail(parsed.data,{redirectTo:appUrl()+'/auth/callback?next=/cont/parola'});
  if(error)return failed(trace,unavailable,'upstream_unavailable',error);
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'upstream_unavailable',error);}
 trace.finish('pending','confirmation_pending');
 return {success:'Dacă adresa poate primi un mesaj de recuperare, vei primi instrucțiunile prin e-mail.'};
}
export async function signOut(){
 const trace=startOperation('auth.sign_out');
 try{
  const db=await supabaseServer();
  const {error}=await db.auth.signOut({scope:'local'});
  if(error){trace.finish('error','upstream_unavailable',{error});redirect('/cont?notice=logout-error');}
 }catch(error){unstable_rethrow(error);trace.finish('error','unexpected_error',{error});throw error;}
 trace.finish('success','completed');
 redirect('/autentificare');
}
export async function saveProfile(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('profile.save');
 const name=z.string().trim().max(80).safeParse(data.get('display_name'));
 if(!name.success)return invalid(trace,'Denumirea poate avea cel mult 80 de caractere.');
 try{
  const {db,user}=await currentUser();
  const {data:existing,error:readError}=await db.from('profiles').select('id').eq('id',user.id).maybeSingle();
  if(readError)return failed(trace,unavailable,'upstream_unavailable',readError);
  const {error}=existing
   ?await db.from('profiles').update({display_name:name.data}).eq('id',user.id)
   :await db.from('profiles').insert({id:user.id,display_name:name.data});
  if(error)return failed(trace,unavailable,'persistence_failed',error);
  revalidatePath('/cont');
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'unexpected_error',error);}
 trace.finish('success','completed');return {success:'Profilul a fost salvat.'};
}
export async function addVehicle(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('vehicle.save');
 const parsed=vehicleSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return invalid(trace,parsed.error.issues[0].message);
 let technical:unknown;
 try{technical=JSON.parse(String(data.get('technical')??'null'));}catch{return invalid(trace,'Verifică datele din talon.');}
 const profile=technicalSchema.safeParse(technical);
 if(!profile.success)return invalid(trace,'Verifică masele, categoria și datele remorcii.');
 try{
  const {db,user}=await currentUser();
  const id=data.get('id');
  if(id&&!z.uuid().safeParse(id).success)return invalid(trace,'Vehicul invalid.');
  const values={...parsed.data,technical:profile.data};
  const {error,data:rows}=id
   ?await db.from('vehicles').update(values).eq('id',String(id)).eq('user_id',user.id).select('id')
   :await db.from('vehicles').insert({...values,user_id:user.id}).select('id');
  if(!error&&!rows?.length)return failed(trace,'Vehiculul nu a putut fi actualizat.','not_found');
  if(error)return failed(trace,error.code==='23505'?'Vehiculul există deja. Verifică și lista vehiculelor arhivate.':unavailable,error.code==='23505'?'conflict':'persistence_failed',error);
  revalidatePath('/cont');
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'unexpected_error',error);}
 trace.finish('success','completed');return {success:'Vehiculul a fost salvat.'};
}
export async function archiveVehicle(data:FormData){
 const trace=startOperation('vehicle.archive');
 const id=z.uuid().safeParse(data.get('id'));
 const archive=data.get('archive');
 if(!id.success||!['yes','no'].includes(String(archive))){trace.finish('invalid','validation_failed');redirect('/cont?notice=vehicle-error');}
 try{
  const {db,user}=await currentUser();
  const {data:rows,error}=await db.from('vehicles').update({archived_at:archive==='yes'?new Date().toISOString():null}).eq('id',id.data).eq('user_id',user.id).select('id');
  if(error||!rows?.length){trace.finish('error',error?'persistence_failed':'not_found',{error});redirect('/cont?notice=vehicle-error');}
  revalidatePath('/cont');
 }catch(error){unstable_rethrow(error);trace.finish('error','unexpected_error',{error});throw error;}
 trace.finish('success','completed');
}
export async function changePassword(_:ActionState,data:FormData):Promise<ActionState>{
 const trace=startOperation('auth.change_password');
 const parsed=z.string().min(8).max(128).safeParse(data.get('password'));
 if(!parsed.success)return invalid(trace,'Folosește o parolă de 8–128 de caractere.');
 if(parsed.data!==data.get('confirmation'))return invalid(trace,'Parolele nu coincid.');
 try{
  const {db}=await currentUser();
  const {error}=await db.auth.updateUser({password:parsed.data});
  if(error)return failed(trace,'Parola nu a putut fi schimbată. Verifică linkul de recuperare sau încearcă o altă parolă.','authentication_failed',error);
 }catch(error){unstable_rethrow(error);return failed(trace,unavailable,'unexpected_error',error);}
 trace.finish('success','completed');return {success:'Parola a fost actualizată.'};
}
