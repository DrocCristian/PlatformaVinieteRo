import {test} from 'node:test';import assert from 'node:assert/strict';import Stripe from 'stripe';
test('Stripe signature verification rejects tampering and stale timestamps',()=>{
 const stripe=new Stripe('sk_test_fixture');const secret='whsec_fixture';
 const payload=JSON.stringify({id:'evt_fixture',object:'event',type:'checkout.session.completed',livemode:false,data:{object:{}}});
 const header=stripe.webhooks.generateTestHeaderString({payload,secret});
 assert.equal(stripe.webhooks.constructEvent(payload,header,secret).id,'evt_fixture');
 assert.throws(()=>stripe.webhooks.constructEvent(payload+' ',header,secret));
 assert.throws(()=>stripe.webhooks.constructEvent(payload,header,'whsec_wrong'));
 const stale=stripe.webhooks.generateTestHeaderString({payload,secret,timestamp:Math.floor(Date.now()/1000)-3600});
 assert.throws(()=>stripe.webhooks.constructEvent(payload,stale,secret));
});
