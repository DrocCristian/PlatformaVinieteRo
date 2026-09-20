import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';import ts from 'typescript';
import * as workspace from '../../packages/domain/purchase-workspace.ts';
import type {ActionState} from '../../packages/domain/account.ts';
const id='20000000-0000-4000-8000-000000000001';
const vehicle:workspace.SavedPurchaseVehicle={id,companyId:null,plate:'SERVER123',registration:'RO',label:'',vehicle:'car',vin:'WVWZZZ1JZXW000001',legacyVin:false,kind:'car',technical:{f1:'3000'},trailer:null};
const data=()=>{const f=new FormData();f.set('basket',JSON.stringify({companyId:null,title:'My order',entries:[{vehicleId:id,trailerId:null,selections:[{country:'AT',duration:'d10',start:'2026-10-01',time:'',year:'2026'}],route:{from:'',to:'',via:''},notify:false}]}));return f;};
function fixture(options:{assets?:workspace.SavedPurchaseVehicle[];failure?:boolean;throwAuth?:boolean}={}){
 const inserted:unknown[]=[];let calls=0;const redirect=Error('redirect');
 const output={exports:{} as {savePurchaseBasket:(state:ActionState,data:FormData)=>Promise<ActionState>}};
 const imports:Record<string,unknown>={
 'next/navigation':{unstable_rethrow:(e:unknown)=>{if(e===redirect)throw e;}},'next/cache':{revalidatePath:()=>{}},
 '../../lib/purchase-context':{purchaseContext:async()=>{
  calls++;
  if(options.throwAuth)throw redirect;
  const db={from:(table:string)=>{
   assert.equal(table,'purchase_drafts');
   return {insert:async(v:unknown)=>{
    inserted.push(v);
    return {error:options.failure?{message:'private-database-error'}:null};
   }};
  }};
  return {user:{id:'current-user'},buyer:null,assets:options.assets??[vehicle],db};
 }},
 '../../packages/domain/purchase-workspace':workspace,'../../packages/domain/catalog':{localToday:()=> '2026-09-20'}
 };
 const code=ts.transpileModule(readFileSync(new URL('../../app/cumpara/actions.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports:output.exports,require:(name:string)=>{assert.ok(name in imports,name);return imports[name];}});
 return {save:output.exports.savePurchaseBasket,inserted,calls:()=>calls,redirect};
}
test('purchase action reconstructs identity from authenticated context before persistence',async()=>{
 const f=fixture();assert.ok((await f.save({},data())).success);assert.equal(f.calls(),1);
 const row=f.inserted[0] as {user_id:string;snapshot:ReturnType<typeof workspace.snapshotPurchaseBasket>};
 assert.equal(row.user_id,'current-user');assert.equal(row.snapshot.entries[0].vehicle.plate,'SERVER123');assert.equal(row.snapshot.paymentEnabled,false);
});
test('purchase action blocks missing/foreign vehicles and preserves login redirect',async()=>{
 const f=fixture({assets:[]});assert.ok((await f.save({},data())).error);assert.equal(f.inserted.length,0);
 const auth=fixture({throwAuth:true});await assert.rejects(auth.save({},data()),e=>e===auth.redirect);assert.equal(auth.inserted.length,0);
});
test('purchase action rejects oversized payload before auth and sanitizes persistence failure',async()=>{
 const f=fixture();const huge=new FormData();huge.set('basket','x'.repeat(200001));assert.ok((await f.save({},huge)).error);assert.equal(f.calls(),0);
 const bad=fixture({failure:true});const result=await bad.save({},data());assert.ok(result.error);assert.doesNotMatch(JSON.stringify(result),/private-database-error/);
});
