import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import * as exportModule from '../../packages/domain/personal-export.ts';

function handler(db:unknown){
 const output={exports:{} as {GET:(request:Request)=>Promise<Response>}};
 const code=ts.transpileModule(readFileSync(new URL('../../app/cont/date/export/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports:output.exports,Response,require:(name:string)=>{if(name==='../../../../packages/domain/personal-export')return exportModule;assert.equal(name,'../../../../lib/supabase/server');return {supabaseServer:async()=>db};}});
 return ()=>output.exports.GET(new Request('https://vignexo.test/cont/date/export'));
}

test('personal export refuses large customer-controlled snapshots instead of buffering them all',async()=>{
 const snapshot='x'.repeat(240000);
 const db={auth:{getUser:async()=>({data:{user:{id:'owner',email:'owner@example.test'}},error:null})},from:(table:string)=>{
  const query={select:()=>query,eq:()=>query,order:()=>query,abortSignal:()=>query,
   range:()=>query,then:(resolve:(value:unknown)=>void)=>resolve({data:table==='purchase_drafts'?Array.from({length:25},(_,id)=>({id,snapshot})):[],error:null})};
  return query;
 }};
 const response=await handler(db)();
 assert.equal(response.status,413);
 assert.equal(response.headers.get('Content-Disposition'),null);
 assert.equal(response.headers.get('Cache-Control'),'private, no-store');
});

test('unauthenticated export does not read tables',async()=>{
 const response=await handler({auth:{getUser:async()=>({data:{user:null},error:null})},from:()=>assert.fail('unauthorized read')})();
 assert.equal(response.status,401);assert.equal(response.headers.get('Content-Disposition'),null);
});

test('database error is sanitized and never returned as a partial download',async()=>{
 const query={select:()=>query,eq:()=>query,order:()=>query,range:()=>query,abortSignal:async()=>({data:null,error:{message:'SECRET_DATABASE_DETAIL'}})};
 const response=await handler({auth:{getUser:async()=>({data:{user:{id:'owner'}},error:null})},from:()=>query})();
 assert.equal(response.status,503);assert.equal(response.headers.get('Content-Disposition'),null);
 assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert.doesNotMatch(await response.text(),/SECRET_DATABASE_DETAIL/);
});
