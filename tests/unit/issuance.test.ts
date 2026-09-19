import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mockProvider,supportedCountries,aggregateOrder,assertTestPayment} from '../../packages/domain/issuance.ts';
test('nine mock providers preserve idempotency and label documents as simulations',async()=>{
 for(const country of supportedCountries){const p=mockProvider(country),r={country,idempotencyKey:'same-key',plate:'B123ABC',scenario:'success' as const};
 assert.deepEqual(await p.issue(r),await p.issue(r));assert.match((await p.issue(r)).document!,/FĂRĂ VALOARE/);
 assert.equal((await p.issue({...r,scenario:'refusal'})).status,'rejected');
 assert.equal((await p.issue({...r,scenario:'timeout'})).status,'unconfirmed');
 assert.equal((await p.getStatus(r.idempotencyKey)).status,'unconfirmed');}
});
test('partial and ambiguous issuance never become a successful order',()=>{
 assert.equal(aggregateOrder(['issued','rejected']),'partial');assert.equal(aggregateOrder(['issued','unconfirmed']),'manual_review');
 assert.equal(aggregateOrder(['issued','pending']),'issuing');assert.equal(aggregateOrder(['issued']),'issued');assert.equal(aggregateOrder(['rejected']),'failed');
});
test('payment gate rejects live and unpaid Checkout events',()=>{
 const event={livemode:false,type:'checkout.session.completed'},s={mode:'payment',payment_status:'paid',amount_total:100,currency:'eur'};
 assert.equal(assertTestPayment(event,s),true);assert.equal(assertTestPayment(event,{...s,payment_status:'unpaid'}),false);
 assert.throws(()=>assertTestPayment({...event,livemode:true},s));assert.equal(assertTestPayment(event,{...s,amount_total:1.5}),false);
});
