'use server';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {currentUser} from '../../../../lib/current-user';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {testStripe} from '../../../../lib/stripe';
import {vehicleSchema} from '../../../../packages/domain/account';
export async function createTestCheckout(data:FormData){
 const {user}=await currentUser();
 const parsed=z.object({id:z.uuid(),plate:vehicleSchema.shape.plate,scenario:z.enum(['success','refusal','timeout']),consent:z.literal('on')}).safeParse(Object.fromEntries(data));
 if(!parsed.success||!commerceConfigured())redirect('/cont/testare?error=configuration');
 const {id,plate,scenario}=parsed.data;
 const db=supabaseAdmin();
 const items=[{country:'AT',amount_minor:100,scenario},{country:'HU',amount_minor:100,scenario:'success'}];
 const order=await db.rpc('create_test_order',{p_id:id,p_user:user.id,p_vehicle:{plate},p_items:items});
 if(order.error)redirect('/cont/testare?error=order');
 let url:string|null=null;
 try{
 const session=await testStripe().checkout.sessions.create({
 mode:'payment',integration_identifier:'vignexo_sandbox_qxnvroab',client_reference_id:id,metadata:{order_id:id},
 line_items:items.map(i=>({quantity:1,price_data:{currency:'eur',unit_amount:i.amount_minor,product_data:{name:'SIMULARE '+i.country+' — nu este vinietă'}}})),
 success_url:process.env.APP_URL+'/cont/comenzi',cancel_url:process.env.APP_URL+'/cont/testare',
 },{idempotencyKey:'test-checkout-'+id});
 if(session.livemode||!session.id.startsWith('cs_test_'))throw new Error('Invalid mode');
 const saved=await db.from('orders').update({payment_session:session.id}).eq('id',id).eq('user_id',user.id).select('id');
 if(saved.error||!saved.data?.length)throw new Error('Session persistence failed');
 url=session.url;
 }catch{redirect('/cont/testare?error=checkout');}
 if(!url)redirect('/cont/testare?error=checkout');
 redirect(url);
}
