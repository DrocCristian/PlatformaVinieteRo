import 'server-only';
import Stripe from 'stripe';
export function testStripe(){
 const key=process.env.STRIPE_SECRET_KEY;
 if(process.env.COMMERCE_MODE!=='test'||!key?.startsWith('sk_test_'))throw new Error('Stripe test configuration required');
 return new Stripe(key,{maxNetworkRetries:2});
}
