'use server';
import { redirect } from 'next/navigation';
import {technicalSchema} from '../../packages/domain/vehicle-profile';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '../../lib/supabase/server';
import { credentialsSchema, vehicleSchema, type ActionState } from '../../packages/domain/account';
const unavailable='Serviciul nu este disponibil momentan. Încearcă din nou.';
const appUrl=()=>process.env.APP_URL ?? 'http://127.0.0.1:3000';
export async function signIn(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=credentialsSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success) return {error:parsed.error.issues[0].message};
 try {
  const db=await supabaseServer();
  const {error}=await db.auth.signInWithPassword(parsed.data);
  if(error) return {error:'Autentificarea nu a reușit. Verifică e-mailul, parola și confirmarea adresei.'};
 } catch { return {error:unavailable}; }
 redirect('/cont');
}
export async function signUp(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=credentialsSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success) return {error:parsed.error.issues[0].message};
 let signedIn=false;
 try {
  const db=await supabaseServer();
  const {data:result,error}=await db.auth.signUp({...parsed.data,options:{emailRedirectTo:appUrl()+'/auth/callback'}});
  if(error) return {error:error.status===429?'Prea multe încercări. Așteaptă înainte de a încerca din nou.':'Contul nu a putut fi creat. Încearcă mai târziu sau autentifică-te dacă ai deja cont.'};
  signedIn=!!result.session;
 } catch {return {error:unavailable};}
 if(signedIn) redirect('/cont');
 return {success:'Verifică e-mailul pentru confirmarea contului. Dacă ai deja un cont, folosește autentificarea.'};
}
export async function recoverPassword(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=z.email().max(254).safeParse(data.get('email'));
 if(!parsed.success)return {error:'Introdu o adresă de e-mail validă.'};
 try {
  const db=await supabaseServer();
  const {error}=await db.auth.resetPasswordForEmail(parsed.data,{redirectTo:appUrl()+'/auth/callback?next=/cont/parola'});
  if(error)return {error:unavailable};
 }catch{return {error:unavailable};}
 return {success:'Dacă adresa poate primi un mesaj de recuperare, vei primi instrucțiunile prin e-mail.'};
}
export async function signOut(){
 const db=await supabaseServer();
 const {error}=await db.auth.signOut({scope:'local'});
 if(error)redirect('/cont?notice=logout-error');
 redirect('/autentificare');
}
async function currentUser(){
 const db=await supabaseServer();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)redirect('/autentificare');
 return {db,user};
}
export async function saveProfile(_:ActionState,data:FormData):Promise<ActionState>{
 const name=z.string().trim().max(80).safeParse(data.get('display_name'));
 if(!name.success)return {error:'Denumirea poate avea cel mult 80 de caractere.'};
 const {db,user}=await currentUser();
 const {data:existing,error:readError}=await db.from('profiles').select('id').eq('id',user.id).maybeSingle();
 if(readError)return {error:unavailable};
 const {error}=existing
  ?await db.from('profiles').update({display_name:name.data}).eq('id',user.id)
  :await db.from('profiles').insert({id:user.id,display_name:name.data});
 if(error)return {error:unavailable};
 revalidatePath('/cont');return {success:'Profilul a fost salvat.'};
}
export async function addVehicle(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=vehicleSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return {error:parsed.error.issues[0].message};
 let technical:unknown;
 try{technical=JSON.parse(String(data.get('technical')??'null'));}catch{return {error:'Verifică datele din talon.'};}
 const profile=technicalSchema.safeParse(technical);
 if(!profile.success)return {error:'Verifică masele, categoria și datele remorcii.'};
 const {db,user}=await currentUser();
 const id=data.get('id');
 if(id&&!z.uuid().safeParse(id).success)return {error:'Vehicul invalid.'};
 const values={...parsed.data,technical:profile.data};
 const {error,data:rows}=id
 ?await db.from('vehicles').update(values).eq('id',String(id)).eq('user_id',user.id).select('id')
 :await db.from('vehicles').insert({...values,user_id:user.id}).select('id');
 if(!error&&!rows?.length)return {error:'Vehiculul nu a putut fi actualizat.'};
 if(error)return {error:error.code==='23505'?'Vehiculul există deja. Verifică și lista vehiculelor arhivate.':unavailable};
 revalidatePath('/cont');return {success:'Vehiculul a fost salvat.'};
}
export async function archiveVehicle(data:FormData){
 const id=z.uuid().safeParse(data.get('id'));
 const archive=data.get('archive');
 if(!id.success||!['yes','no'].includes(String(archive)))redirect('/cont?notice=vehicle-error');
 const {db,user}=await currentUser();
 const {data:rows,error}=await db.from('vehicles').update({archived_at:archive==='yes'?new Date().toISOString():null}).eq('id',id.data).eq('user_id',user.id).select('id');
 if(error||!rows?.length)redirect('/cont?notice=vehicle-error');
 revalidatePath('/cont');
}
export async function changePassword(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=z.string().min(8).max(128).safeParse(data.get('password'));
 if(!parsed.success)return {error:'Folosește o parolă de 8–128 de caractere.'};
 if(parsed.data!==data.get('confirmation'))return {error:'Parolele nu coincid.'};
 const {db}=await currentUser();
 const {error}=await db.auth.updateUser({password:parsed.data});
 if(error)return {error:'Parola nu a putut fi schimbată. Verifică linkul de recuperare sau încearcă o altă parolă.'};
 return {success:'Parola a fost actualizată.'};
}
