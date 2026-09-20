'use server';
import {redirect,unstable_rethrow} from 'next/navigation';
import {z} from 'zod';
import {currentUser} from '../../../../lib/current-user';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {testStripe} from '../../../../lib/stripe';
import {startOperation} from '../../../../lib/observability';
import {vehicleSchema} from '../../../../packages/domain/account';
export async function createTestCheckout(data:FormData){
 const {user}=await currentUser();
 const trace=startOperation('checkout.create');
 const fail=(reason:string)=>redirect('/cont/testare?error='+reason+'&reference='+trace.requestId);
 const parsed=z.object({id:z.uuid(),plate:vehicleSchema.shape.plate,scenario:z.enum(['success','refusal','timeout']),consent:z.literal('on')}).safeParse(Object.fromEntries(data));
 if(!parsed.success){trace.finish('invalid','validation_failed');redirect('/cont/testare?error=configuration');}
 if(!commerceConfigured()){trace.finish('ignored','configuration_missing');fail('configuration');}
 const {id,plate,scenario}=parsed.data;
 const items=[{country:'AT',amount_minor:100,scenario},{country:'HU',amount_minor:100,scenario:'success'}];
 let url:string|null=null;
 try{
  const db=supabaseAdmin();
  const order=await db.rpc('create_test_order',{p_id:id,p_user:user.id,p_vehicle:{plate},p_items:items});
  if(order.error){trace.finish('error','persistence_failed',{error:order.error});fail('order');}
  const session=await testStripe().checkout.sessions.create({
   mode:'payment',integration_identifier:'vignexo_sandbox_qxnvroab',client_reference_id:id,metadata:{order_id:id},
   line_items:items.map(i=>({quantity:1,price_data:{currency:'eur',unit_amount:i.amount_minor,product_data:{name:'SIMULARE '+i.country+' — nu este vinietă'}}})),
   success_url:process.env.APP_URL+'/cont/comenzi',cancel_url:process.env.APP_URL+'/cont/testare',
  },{idempotencyKey:'test-checkout-'+id});
  if(session.livemode||!session.id.startsWith('cs_test_')){trace.finish('denied','live_event_rejected');fail('checkout');}
  const saved=await db.from('orders').update({payment_session:session.id}).eq('id',id).eq('user_id',user.id).select('id');
  if(saved.error||!saved.data?.length){trace.finish('error','persistence_failed',{error:saved.error});fail('checkout');}
  url=session.url;
 }catch(error){unstable_rethrow(error);trace.finish('error','upstream_unavailable',{error});fail('checkout');}
 if(!url){trace.finish('error','unexpected_error');fail('checkout');}
 trace.finish('success','completed');
 redirect(url!);
}
