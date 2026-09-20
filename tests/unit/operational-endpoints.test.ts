import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {timingSafeEqual} from 'node:crypto';
import ts from 'typescript';
import Stripe from 'stripe';
import {z} from 'zod';
import {createOperation,type DiagnosticRecord,type Operation} from '../../packages/domain/telemetry.ts';
import * as issuance from '../../packages/domain/issuance.ts';
import * as batch from '../../packages/domain/issuance-batch.ts';

const secret='whsec_fixture_only';
const stripe=new Stripe('sk_test_fixture_only');
type RpcResult={data?:unknown;error?:unknown};
function endpoint(path:string,configured:boolean,db:unknown){
 const records:DiagnosticRecord[]=[];
 const output={exports:{} as {POST:(request:Request)=>Promise<Response>}};
 const imports:Record<string,unknown>={
  zod:{z},stripe:{},
  'node:crypto':{timingSafeEqual},
  '../../../../lib/stripe':{testStripe:()=>stripe},
  '../../../../lib/supabase/admin':{commerceConfigured:()=>configured,supabaseAdmin:()=>db},
  '../../../../lib/observability':{startOperation:(operation:Operation)=>createOperation(operation,r=>records.push(r))},
  '../../../../packages/domain/issuance':issuance,
  '../../../../packages/domain/issuance-batch':batch
 };
 const source=readFileSync(new URL('../../'+path,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports:output.exports,require:(name:string)=>{assert.ok(name in imports,'Unexpected import '+name);return imports[name];},Response,Buffer,process:{env:{STRIPE_WEBHOOK_SECRET:secret,ISSUANCE_WORKER_SECRET:'worker_fixture_only'}}});
 return {post:output.exports.POST,records};
}
function signed(type:string,object:object,livemode=false){
 const payload=JSON.stringify({id:'evt_fixture',type,livemode,data:{object}});
 return new Request('https://example.test/api/stripe/webhook',{method:'POST',body:payload,headers:{'stripe-signature':stripe.webhooks.generateTestHeaderString({payload,secret})}});
}
const paid={id:'cs_test_fixture',mode:'payment',payment_status:'paid',amount_total:200,currency:'eur',payment_intent:'pi_fixture',metadata:{order_id:'12345678-1234-4234-8234-123456789abc'}};
const webhook='app/api/stripe/webhook/route.ts';
const worker='app/api/internal/issuance/route.ts';
test('endpoint disabled responses include independent support references and no-store',async()=>{
 for(const path of [webhook,worker]){
  const e=endpoint(path,false,null);
  const r=await e.post(new Request('https://example.test',{method:'POST'}));
  assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'no-store');
  const body=await r.json();assert.equal(body.requestId,r.headers.get('x-request-id'));
  assert.equal(e.records[0].request_id,body.requestId);assert.equal(e.records[0].code,'configuration_missing');
 }
});
test('webhook keeps raw signature and live-mode protections before any database call',async()=>{
 const e=endpoint(webhook,true,{rpc(){assert.fail('Database must not be called');}});
 const unsigned=await e.post(new Request('https://example.test',{method:'POST',body:'{}'}));assert.equal(unsigned.status,400);
 const tampered=signed('checkout.session.completed',paid);const text=await tampered.text();
 const bad=await e.post(new Request(tampered.url,{method:'POST',headers:tampered.headers,body:text+' '}));assert.equal(bad.status,400);
 const live=await e.post(signed('checkout.session.completed',paid,true));assert.equal(live.status,400);
 assert.deepEqual(e.records.map(r=>r.code),['signature_invalid','signature_invalid','live_event_rejected']);
});
test('webhook persistence failures return retriable 500 and sanitized diagnostics',async()=>{
 const e=endpoint(webhook,true,{rpc:async()=>({error:{code:'23503',message:'private@example.test card secret'}})});
 const r=await e.post(signed('checkout.session.completed',paid));
 assert.equal(r.status,500);assert.equal(e.records[0].code,'persistence_failed');
 assert.doesNotMatch(JSON.stringify(e.records)+await r.text(),/private@example|card secret|order_id|pi_fixture/);
});
test('webhook distinguishes confirmed and duplicate events and ignores unpaid or expired sessions',async()=>{
 let calls=0;
 const e=endpoint(webhook,true,{rpc:async():Promise<RpcResult>=>({data:++calls===1,error:null})});
 assert.equal((await e.post(signed('checkout.session.completed',paid))).status,200);
 assert.equal((await e.post(signed('checkout.session.completed',paid))).status,200);
 assert.equal((await e.post(signed('checkout.session.completed',{...paid,payment_status:'unpaid'}))).status,200);
 assert.equal((await e.post(signed('checkout.session.expired',paid))).status,200);
 assert.equal((await e.post(signed('checkout.session.async_payment_failed',paid))).status,200);
 assert.equal(calls,2);
 assert.deepEqual(e.records.map(r=>r.code),['payment_confirmed','payment_duplicate','payment_pending','checkout_expired','payment_failed']);
});
test('worker authorization stops processing and mixed failures remain visible without retry',async()=>{
 const finalized:string[]=[];
 const jobs=[{id:'job1',item_id:'item1'},{id:'job2',item_id:'item2'},{id:'job3',item_id:'item3'}];
 const db={
  rpc:async(name:string,args?:Record<string,unknown>):Promise<RpcResult>=>{
   if(name==='recover_test_jobs')return {error:null};
   if(name==='claim_test_jobs')return {data:jobs,error:null};
   assert.equal(name,'finish_test_job');finalized.push(String(args?.p_job));return {error:null};
  },
  from:()=>({select:()=>({eq:(_key:string,id:string)=>({single:async()=>{
   if(id==='item2')return {error:{code:'PGRST116',message:'private data'}};
   return {data:{country:'AT',provider:'mock-AT',idempotency_key:id,product_snapshot:{scenario:id==='item3'?'timeout':'success'},orders:{vehicle:{plate:'B123ABC'}}},error:null};
  }})})})
 };
 const e=endpoint(worker,true,db);
 assert.equal((await e.post(new Request('https://example.test',{method:'POST'}))).status,401);
 const r=await e.post(new Request('https://example.test',{method:'POST',headers:{authorization:'Bearer worker_fixture_only'}}));
 assert.equal(r.status,500);const body=await r.json();
 assert.equal(body.claimed,3);assert.equal(body.completed,2);assert.equal(body.failed,1);assert.equal(body.manualReview,1);
 assert.deepEqual(finalized,['job1','job3']);assert.equal(e.records.at(-1)?.code,'partial_failure');
 assert.doesNotMatch(JSON.stringify(e.records),/B123ABC|item1|job1|private data|worker_fixture_only/);
});
