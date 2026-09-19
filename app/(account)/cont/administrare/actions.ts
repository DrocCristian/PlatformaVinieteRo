'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requireStaff} from '../../../../lib/staff';
import type {ActionState} from '../../../../packages/domain/account';
export async function answerSupport(_:ActionState,data:FormData):Promise<ActionState>{
 const {db}=await requireStaff(['superadmin','support']);
 const parsed=z.object({id:z.uuid(),status:z.enum(['open','reviewing','resolved']),response:z.string().trim().min(1).max(4000)}).safeParse(Object.fromEntries(data));
 if(!parsed.success)return {error:'Verifică răspunsul și starea solicitării.'};
 const {id,...values}=parsed.data;
 const result=await db.from('support_cases').update(values).eq('id',id).select('id');
 if(result.error||!result.data?.length)return {error:'Actualizarea nu a reușit.'};
 revalidatePath('/cont/administrare');revalidatePath('/cont/suport');
 return {success:'Răspunsul a fost salvat în contul clientului.'};
}
