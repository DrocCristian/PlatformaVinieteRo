import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
import * as account from '../../packages/domain/account.ts';
import * as vehicle from '../../packages/domain/vehicle-profile.ts';
import {createOperation,type DiagnosticRecord,type Operation} from '../../packages/domain/telemetry.ts';

type AuthResult={data:{user:unknown};error:unknown};
type SessionModule={currentUser:()=>Promise<unknown>;isAuthUpstreamFailure:(error:unknown)=>boolean};
function load<T>(path:string,imports:Record<string,unknown>):T{
 const output={exports:{} as T};
 const source=readFileSync(new URL('../../'+path,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports:output.exports,require:(name:string)=>{assert.ok(name in imports,'Unexpected import '+name);return imports[name];},process:{env:{}}});
 return output.exports;
}
function fixture(result:AuthResult,thrown?:unknown){
 const records:DiagnosticRecord[]=[];
 const redirects:Array<{path:string}>=[];
 const navigation={
  redirect:(path:string):never=>{const signal={path};redirects.push(signal);throw signal;},
  unstable_rethrow:(error:unknown)=>{if(redirects.includes(error as {path:string}))throw error;}
 };
 const resolve=async()=>{if(thrown)throw thrown;return result;};
 const db={auth:{getUser:resolve,signInWithPassword:resolve}};
 const observability={startOperation:(operation:Operation)=>createOperation(operation,r=>records.push(r))};
 const session=load<SessionModule>('lib/current-user.ts',{'server-only':{},'next/navigation':navigation,'./supabase/server':{supabaseServer:async()=>db},'./observability':observability});
 const actions=load<{signIn:(state:account.ActionState,data:FormData)=>Promise<account.ActionState>}>('app/(account)/actions.ts',{
  'next/navigation':navigation,'next/cache':{revalidatePath:()=>assert.fail('signIn must not revalidate')},zod:{z},
  '../../packages/domain/vehicle-profile':vehicle,'../../packages/domain/account':account,
  '../../lib/supabase/server':{supabaseServer:async()=>db},'../../lib/current-user':session,'../../lib/observability':observability
 });
 return {...actions,...session,records,redirects,navigation};
}
function credentials(){const data=new FormData();data.set('email','private-fixture@example.test');data.set('password','private-fixture-password');return data;}
const outages=[{status:500},{status:503},{status:429},{name:'AuthRetryableFetchError',status:0},{name:'NetworkError'},{code:'request_timeout'},{code:'over_request_rate_limit'},{code:'over_email_send_rate_limit'},{code:'ECONNRESET'},{name:'TypeError',cause:{code:'UND_ERR_CONNECT_TIMEOUT'}}];

test('signIn classifies returned outages as errors and correlates support references without PII',async()=>{
 for(const error of outages){
  const f=fixture({data:{user:null},error:{...error,message:'private-fixture@example.test private-fixture-password'}});
  const state=await f.signIn({},credentials());
  assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'error');assert.equal(f.records[0].code,'upstream_unavailable');
  assert.ok(state.error);assert.equal(state.reference,f.records[0].request_id);assert.equal(f.redirects.length,0);
  assert.doesNotMatch(JSON.stringify(f.records)+JSON.stringify(state),/private-fixture/);
 }
});
test('invalid credentials remain denied with a correlated support reference',async()=>{
 const f=fixture({data:{user:null},error:{status:400,code:'invalid_credentials'}});
 const state=await f.signIn({},credentials());
 assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'denied');assert.equal(f.records[0].code,'authentication_failed');
 assert.equal(state.reference,f.records[0].request_id);
});
test('simple signIn validation has no support reference',async()=>{
 const f=fixture({data:{user:null},error:null});
 const state=await f.signIn({},new FormData());
 assert.equal(state.reference,undefined);assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'invalid');
});
test('currentUser preserves login redirect for returned outages but logs an infrastructure error',async()=>{
 for(const error of outages){
  const f=fixture({data:{user:null},error});
  await assert.rejects(f.currentUser(),e=>e===f.redirects[0]&&f.redirects[0].path==='/autentificare');
  assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'error');assert.equal(f.records[0].code,'upstream_unavailable');
 }
});
test('missing sessions and authentication denials keep the existing redirect and denied classification',async()=>{
 for(const error of [null,{status:400,code:'session_not_found'},{status:401,code:'invalid_credentials'}]){
  const f=fixture({data:{user:null},error});
  await assert.rejects(f.currentUser(),e=>e===f.redirects[0]&&f.redirects[0].path==='/autentificare');
  assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'denied');assert.equal(f.records[0].code,'authentication_failed');
 }
});
test('thrown retry/network failures are logged and currentUser retains the original thrown error',async()=>{
 const error={name:'AuthRetryableFetchError',status:0,message:'private-fixture-password'};
 const session=fixture({data:{user:null},error:null},error);
 await assert.rejects(session.currentUser(),e=>e===error);
 assert.equal(session.records.length,1);assert.equal(session.records[0].code,'upstream_unavailable');
 assert.doesNotMatch(JSON.stringify(session.records),/private-fixture/);
 const action=fixture({data:{user:null},error:null},error);
 const state=await action.signIn({},credentials());
 assert.equal(action.records.length,1);assert.equal(state.reference,action.records[0].request_id);assert.equal(action.records[0].code,'upstream_unavailable');
});
test('successful signIn redirect is not swallowed or classified as an error',async()=>{
 const f=fixture({data:{user:{id:'fixture-user'}},error:null});
 await assert.rejects(f.signIn({},credentials()),e=>e===f.redirects[0]&&f.redirects[0].path==='/cont');
 assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'success');assert.equal(f.records[0].code,'completed');
});
test('currentUser success returns the session without logging its identity',async()=>{
 const f=fixture({data:{user:{id:'private-fixture-user',email:'private-fixture@example.test'}},error:null});
 assert.ok(await f.currentUser());assert.equal(f.records.length,1);assert.equal(f.records[0].outcome,'success');
 assert.doesNotMatch(JSON.stringify(f.records),/private-fixture/);
});

test('Next control-flow exceptions from auth calls pass through unchanged',async()=>{
 for(const action of ['session','signIn']){
  const signal={path:'/autentificare'};
  const f=fixture({data:{user:null},error:null},signal);
  f.redirects.push(signal);
  await assert.rejects(action==='session'?f.currentUser():f.signIn({},credentials()),e=>e===signal);
  assert.equal(f.records.length,0);
 }
});
