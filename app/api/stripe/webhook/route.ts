import {z} from 'zod';
import {testStripe} from '../../../../lib/stripe';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {startOperation} from '../../../../lib/observability';
import {assertTestPayment} from '../../../../packages/domain/issuance';
import type Stripe from 'stripe';
export const runtime='nodejs';
export async function POST(request:Request){
 const trace=startOperation('stripe.webhook');
 const respond=(body:object,status=200)=>Response.json({...body,requestId:trace.requestId},{status,headers:{'Cache-Control':'no-store','X-Request-ID':trace.requestId}});
 if(!commerceConfigured()){trace.finish('ignored','configuration_missing');return respond({error:'Unavailable'},503);}
 const signature=request.headers.get('stripe-signature');
 if(!signature){trace.finish('denied','signature_invalid');return respond({error:'Invalid signature'},400);}
 let event:Stripe.Event;
 try{event=testStripe().webhooks.constructEvent(await request.text(),signature,process.env.STRIPE_WEBHOOK_SECRET!);}
 catch{trace.finish('denied','signature_invalid');return respond({error:'Invalid signature'},400);}
 if(event.livemode){trace.finish('denied','live_event_rejected');return respond({error:'Live events are disabled'},400);}
 // Diagnostic only: these events cannot schedule issuance or change payment state.
 if(event.type==='checkout.session.expired'||event.type==='checkout.session.async_payment_failed'){
  trace.finish('ignored',event.type==='checkout.session.expired'?'checkout_expired':'payment_failed');return respond({received:true});
 }
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){trace.finish('ignored','event_ignored');return respond({received:true});}
 try{
  const session=event.data.object as Stripe.Checkout.Session;
  if(!assertTestPayment(event,session)){trace.finish('pending','payment_pending');return respond({received:true});}
  const order=z.uuid().safeParse(session.metadata?.order_id);
  if(!order.success||!session.id.startsWith('cs_test_')){trace.finish('invalid','validation_failed');return respond({error:'Invalid test order'},400);}
  const intent=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
  if(!intent){trace.finish('invalid','validation_failed');return respond({error:'Missing payment intent'},400);}
  const {data,error}=await supabaseAdmin().rpc('confirm_test_payment',{p_event:event.id,p_order:order.data,p_session:session.id,p_intent:intent,p_amount:session.amount_total,p_currency:session.currency,p_type:event.type});
  if(error){trace.finish('error','persistence_failed',{error});return respond({error:'Payment could not be recorded'},500);}
  trace.finish('success',data===false?'payment_duplicate':'payment_confirmed');
  return respond({received:true});
 }catch(error){trace.finish('error','unexpected_error',{error});return respond({error:'Payment could not be recorded'},500);}
}
