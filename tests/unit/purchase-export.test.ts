import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import ts from 'typescript';
test('private export includes new drafts and fleet tables, uses authenticated RLS client and no-store',async()=>{
 const reads:{table:string;filters:[string,unknown][]}[]=[];
 const db={auth:{getUser:async()=>({data:{user:{id:'user-a',email:'a@example.test'}},error:null})},from:(table:string)=>{
  const read={table,filters:[] as [string,unknown][]};reads.push(read);
  const builder={select:()=>builder,eq:(key:string,value:unknown)=>{read.filters.push([key,value]);return builder;},order:()=>builder,range:async()=>({data:[],error:null})};return builder;
 }};
 const out={exports:{} as {GET:()=>Promise<Response>}};
 const code=ts.transpileModule(readFileSync(new URL('../../app/cont/date/export/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports:out.exports,Response,require:(name:string)=>{assert.equal(name,'../../../../lib/supabase/server');return {supabaseServer:async()=>db};}});
 const result=await out.exports.GET();assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'private, no-store');
 const body=await result.json();assert.ok('purchase_drafts' in body);assert.ok('fleet_assets' in body);
 assert.deepEqual(reads.find(r=>r.table==='purchase_drafts')?.filters,[['user_id','user-a']]);assert.deepEqual(reads.find(r=>r.table==='fleet_companies')?.filters,[['owner_id','user-a']]);
});
