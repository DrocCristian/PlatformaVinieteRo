import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createOperation,safeDigest,type DiagnosticRecord,type DiagnosticDetails,type Operation} from '../../packages/domain/telemetry.ts';
import {runIssuanceBatch,batchStatus} from '../../packages/domain/issuance-batch.ts';

test('telemetry copies only allowlisted fields, never payloads, messages or stack traces',()=>{
 const records:DiagnosticRecord[]=[];let now=1000;
 const trace=createOperation('profile.save',r=>records.push(r),()=>now);
 now+=72;
 trace.finish('error','persistence_failed',{error:{code:'23505',status:409,message:'secret@example.test B123ABC',stack:'Bearer secret',details:{password:'secret'}},digest:'123456',routeType:'action',email:'secret@example.test'} as DiagnosticDetails);
 trace.finish('success','completed');
 assert.equal(records.length,1);const r=records[0];
 assert.equal(r.request_id,trace.requestId);assert.match(r.request_id,/^[0-9a-f-]{36}$/);
 assert.equal(r.duration_ms,72);assert.equal(r.provider_code,'23505');assert.equal(r.upstream_status,409);
 assert.equal(r.digest,'123456');assert.equal(r.route_type,'action');
 assert.deepEqual(Object.keys(r).sort(),['schema_version','event','operation','outcome','code','request_id','duration_ms','timestamp','provider_code','upstream_status','digest','route_type'].sort());
 assert.doesNotMatch(JSON.stringify(r),/secret|B123ABC|Bearer|password|stack/);
});
test('telemetry rejects arbitrary labels and malformed errors and cannot break business operations',()=>{
 const records:DiagnosticRecord[]=[];
 const trace=createOperation('private@example.test' as Operation,r=>records.push(r));
 trace.finish('error','unexpected_error',{error:{code:'private@example.test',status:999},digest:'token',routeType:'/cont/private'});
 assert.equal(records[0].operation,'server.request');assert.equal(records[0].provider_code,undefined);assert.equal(records[0].upstream_status,undefined);assert.equal(records[0].digest,undefined);assert.equal(records[0].route_type,undefined);
 assert.doesNotThrow(()=>createOperation('auth.sign_in',()=>{throw Error('sink down');}).finish('success','completed'));
 assert.doesNotThrow(()=>createOperation('auth.sign_in',r=>records.push(r)).finish('error','unexpected_error',{error:{get code(){throw Error('getter');}}}));
 assert.equal(safeDigest('12345'),'12345');assert.equal(safeDigest('NEXT_REDIRECT;secret'),undefined);
});
test('telemetry bounds counters and elapsed duration',()=>{
 const records:DiagnosticRecord[]=[];let now=1000;
 const trace=createOperation('issuance.batch',r=>records.push(r),()=>now);now=500;
 trace.finish('error','partial_failure',{counts:{claimed:10,completed:2,failed:NaN,manualReview:-1,rejected:10001}});
 assert.equal(records[0].duration_ms,0);
 assert.deepEqual(records[0].counts,{claimed:10,completed:2,failed:0,manualReview:0,rejected:0});
});
test('issuance batch isolates technical failures and does not retry an issued item',async()=>{
 const calls:number[]=[];
 const counts=await runIssuanceBatch([1,2,3,4,5],async id=>{
  calls.push(id);
  if(id===2)throw Error('provider unavailable');
  if(id===3)return {ok:false,code:'finalize_failed'};
  return {ok:true,status:id===4?'unconfirmed':id===5?'rejected':'issued'};
 });
 assert.deepEqual(calls,[1,2,3,4,5]);
 assert.deepEqual(counts,{claimed:5,completed:3,failed:2,manualReview:1,rejected:1});assert.equal(batchStatus(counts),500);
});
test('issuance empty and business refusal batches remain successful transport responses',async()=>{
 assert.deepEqual(await runIssuanceBatch([],async()=>({ok:true,status:'issued'})),{claimed:0,completed:0,failed:0,manualReview:0,rejected:0});
 const counts=await runIssuanceBatch([1],async()=>({ok:true,status:'rejected'}));
 assert.equal(batchStatus(counts),200);assert.equal(counts.rejected,1);
});
