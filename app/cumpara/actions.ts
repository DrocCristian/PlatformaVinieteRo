'use server';
import {unstable_rethrow} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {purchaseContext} from '../../lib/purchase-context';
import {purchaseBasketSchema,snapshotPurchaseBasket} from '../../packages/domain/purchase-workspace';
import {localToday} from '../../packages/domain/catalog';
import type {ActionState} from '../../packages/domain/account';
export async function savePurchaseBasket(_:ActionState,data:FormData):Promise<ActionState>{
 const raw=data.get('basket');
 if(typeof raw!=='string'||raw.length>200000)return {error:'Comanda este prea mare sau invalidă.'};
 let input:unknown;try{input=JSON.parse(raw);}catch{return {error:'Comanda nu este validă.'};}
 const parsed=purchaseBasketSchema.safeParse(input);
 if(!parsed.success)return {error:'Verifică vehiculele, țările și perioadele.'};
 try{
  const {db,user,buyer,assets}=await purchaseContext(parsed.data.companyId);
  let snapshot;try{snapshot=snapshotPurchaseBasket(parsed.data,assets,localToday());}catch(e){return {error:e instanceof Error?e.message:'Verifică datele comenzii.'};}
  const {error}=await db.from('purchase_drafts').insert({user_id:user.id,company_id:parsed.data.companyId,title:parsed.data.title,snapshot:{...snapshot,buyer}});
  if(error)return {error:'Ciorna nu a putut fi salvată. Reîncearcă.'};
  revalidatePath('/cumpara');
  return {success:'Comanda comună a fost salvată. Nu s-a efectuat o plată și nu s-au emis viniete.'};
 }catch(e){unstable_rethrow(e);return {error:'Salvarea este temporar indisponibilă.'};}
}
