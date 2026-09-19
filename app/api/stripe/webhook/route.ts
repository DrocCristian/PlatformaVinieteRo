import {testStripe} from '../../../../lib/stripe';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {assertTestPayment} from '../../../../packages/domain/issuance';
import type Stripe from 'stripe';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!commerceConfigured())return Response.json({error:'Unavailable'},{status:503});
 const signature=request.headers.get('stripe-signature');
 if(!signature)return Response.json({error:'Invalid signature'},{status:400});
 let event:Stripe.Event;
 try{event=testStripe().webhooks.constructEvent(await request.text(),signature,process.env.STRIPE_WEBHOOK_SECRET!);}
 catch{return Response.json({error:'Invalid signature'},{status:400});}
 if(event.livemode)return Response.json({error:'Live events are disabled'},{status:400});
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return Response.json({received:true});
 const session=event.data.object as Stripe.Checkout.Session;
 if(!assertTestPayment(event,session))return Response.json({received:true});
 const order=session.metadata?.order_id;
 if(!order||!session.id.startsWith('cs_test_'))return Response.json({error:'Invalid test order'},{status:400});
 const intent=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
 if(!intent)return Response.json({error:'Missing payment intent'},{status:400});
 const {error}=await supabaseAdmin().rpc('confirm_test_payment',{p_event:event.id,p_order:order,p_session:session.id,p_intent:intent,p_amount:session.amount_total,p_currency:session.currency,p_type:event.type});
 if(error)return Response.json({error:'Payment could not be recorded'},{status:500});
 return Response.json({received:true});
}
