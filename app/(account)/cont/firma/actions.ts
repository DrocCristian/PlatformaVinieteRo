'use server';
import {revalidatePath} from 'next/cache';
import {unstable_rethrow} from 'next/navigation';
import {z} from 'zod';
import {currentUser} from '../../../../lib/current-user';
import {companySchema,fleetAssetSchema,batchSchema,snapshotBatch,type FleetAsset} from '../../../../packages/domain/fleet';
import type {ActionState} from '../../../../packages/domain/account';
async function context(){
 const session=await currentUser();
 if(process.env.FLEET_WORKSPACE_ENABLED!=='true')throw Error('FLEET_DISABLED');
 return session;
}
export async function saveCompany(_:ActionState,data:FormData):Promise<ActionState>{
 const parsed=companySchema.safeParse(Object.fromEntries(data));
 if(!parsed.success)return {error:'Verifică denumirea, codul fiscal, țara, adresa și e-mailul.'};
 try{
  const {db,user}=await context();
  const id=data.get('company_id');
  if(id&&!z.uuid().safeParse(id).success)return {error:'Firma nu este validă.'};
  const result=id?await db.from('fleet_companies').update(parsed.data).eq('id',id).eq('owner_id',user.id).select('id'):
   await db.from('fleet_companies').insert({...parsed.data,owner_id:user.id}).select('id');
  if(result.error||!result.data?.length)return {error:'Firma nu a putut fi salvată.'};
  revalidatePath('/cont/firma');return {success:'Datele firmei au fost salvate.'};
 }catch(e){unstable_rethrow(e);return {error:'Salvarea nu este disponibilă momentan.'};}
}
export async function saveFleetAsset(_:ActionState,data:FormData):Promise<ActionState>{
 const company=z.uuid().safeParse(data.get('company_id'));
 const raw:Record<string,unknown>=Object.fromEntries(data);
 for(const key of ['f1','f2','f3','axles','co2_class'])raw[key]=raw[key]?Number(raw[key]):null;
 const asset=fleetAssetSchema.safeParse(raw);
 if(!company.success||!asset.success)return {error:asset.error?.issues[0]?.message??'Selectează firma.'};
 try{
  const {db,user}=await context();
  const owner=await db.from('fleet_companies').select('id').eq('id',company.data).eq('owner_id',user.id).maybeSingle();
  if(owner.error||!owner.data)return {error:'Firma nu este disponibilă în contul tău.'};
  const {error}=await db.from('fleet_assets').insert({...asset.data,company_id:company.data});
  if(error)return {error:'Vehiculul nu a putut fi salvat. Verifică dacă numărul există deja în flotă.'};
  revalidatePath('/cont/firma');return {success:'Vehiculul a fost adăugat în flotă.'};
 }catch(e){unstable_rethrow(e);return {error:'Salvarea nu este disponibilă momentan.'};}
}
export async function saveFleetBatch(_:ActionState,data:FormData):Promise<ActionState>{
 let input:unknown;try{input=JSON.parse(String(data.get('batch')));}catch{return {error:'Comanda nu este validă.'};}
 const parsed=batchSchema.safeParse(input);
 if(!parsed.success)return {error:parsed.error.issues[0].message};
 try{
  const {db,user}=await context();
  const company=await db.from('fleet_companies').select('id,name,tax_id,country,billing_address,billing_email').eq('id',parsed.data.company_id).eq('owner_id',user.id).maybeSingle();
  if(company.error||!company.data)return {error:'Firma nu este disponibilă.'};
  const ids=parsed.data.vehicles.flatMap(x=>[x.vehicle_id,...(x.trailer_id?[x.trailer_id]:[])]);
  const assets=await db.from('fleet_assets').select('id,company_id,plate,registration_country,label,kind,f1,f2,f3,axles,euro,co2_class').eq('company_id',parsed.data.company_id).in('id',ids).is('archived_at',null);
  if(assets.error)return {error:'Flota nu a putut fi verificată.'};
  let snapshot;
  try{snapshot=snapshotBatch(parsed.data,(assets.data??[]) as FleetAsset[]);}catch{return {error:'Verifică vehiculele și alocarea remorcilor.'};}
  const {error}=await db.from('fleet_purchase_drafts').insert({company_id:parsed.data.company_id,title:parsed.data.title,snapshot:{...snapshot,buyer:company.data}});
  if(error)return {error:'Comanda nu a putut fi salvată.'};
  revalidatePath('/cont/firma');return {success:'Comanda comună a fost salvată ca ciornă. Plata și emiterea vor fi disponibile după activarea furnizorilor.'};
 }catch(e){unstable_rethrow(e);return {error:'Salvarea nu este disponibilă momentan.'};}
}
