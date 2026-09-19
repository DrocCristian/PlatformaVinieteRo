'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {currentUser} from '../../../lib/current-user';
import {journeySchema,supportSchema} from '../../../packages/domain/workspace';
import type {ActionState} from '../../../packages/domain/account';
export async function saveJourney(_:ActionState,data:FormData):Promise<ActionState>{
 let destinations:unknown;
 try{destinations=JSON.parse(String(data.get('destinations')??''));}catch{return {error:'Verifică țările și perioadele.'};}
 const parsed=journeySchema.safeParse({...Object.fromEntries(data),destinations});
 if(!parsed.success)return {error:parsed.error.issues[0].message};
 const {db,user}=await currentUser();
 const {error}=await db.from('journeys').insert({...parsed.data,user_id:user.id});
 if(error)return {error:'Călătoria nu a putut fi salvată. Reîncearcă mai târziu.'};
 revalidatePath('/cont/calatorii');
 return {success:'Călătoria a fost salvată în cont. Nu reprezintă o vinietă sau o comandă.'};
}
export async function archiveJourney(data:FormData){
 const id=z.uuid().safeParse(data.get('id'));
 const {db,user}=await currentUser();
 if(!id.success)redirect('/cont/calatorii?error=1');
 const {data:rows,error}=await db.from('journeys').update({archived_at:data.get('archive')==='no'?null:new Date().toISOString()}).eq('id',id.data).eq('user_id',user.id).select('id');
 if(error||!rows?.length)redirect('/cont/calatorii?error=1');
 revalidatePath('/cont/calatorii');
}
export async function createSupportCase(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=supportSchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return {error:parsed.error.issues[0].message};
 const {db,user}=await currentUser();
 const {error}=await db.from('support_cases').insert({...parsed.data,user_id:user.id});
 if(error)return {error:'Solicitarea nu a putut fi salvată. Reîncearcă mai târziu.'};
 revalidatePath('/cont/suport');return {success:'Solicitarea a fost înregistrată. O poți urmări în cont. Confirmarea prin e-mail nu este încă activă.'};
}
export async function savePreferences(_:ActionState,data:FormData):Promise<ActionState>{
 const language=z.enum(['ro','en','de']).safeParse(data.get('language'));
 if(!language.success)return {error:'Selectează limba.'};
 const {db,user}=await currentUser();
 const values={expiration_email:data.get('expiration_email')==='on',language:language.data};
 const existing=await db.from('notification_preferences').select('user_id').eq('user_id',user.id).maybeSingle();
 if(existing.error)return {error:'Preferințele nu au putut fi citite.'};
 const {error}=existing.data?await db.from('notification_preferences').update(values).eq('user_id',user.id):await db.from('notification_preferences').insert({...values,user_id:user.id});
 if(error)return {error:'Preferințele nu au putut fi salvate.'};
 revalidatePath('/cont/notificari');return {success:'Preferințele au fost salvate. Trimiterea notificărilor va fi disponibilă după activarea serviciului.'};
}

