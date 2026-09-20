import {test} from 'node:test';
import assert from 'node:assert/strict';
import {personalExport,ExportLimitError} from '../../packages/domain/personal-export.ts';

const limits={pageSize:2,maxRows:10,maxBytes:4096,timeoutMs:1000};
const signal=()=>new AbortController().signal;
const metadata={exported_at:'2026-09-20',account:{id:'owner',email:'owner@example.test'}};

test('complete export retains nested and archived rows across pages with sequential reads',async()=>{
 const records:Record<string,unknown[]>={vehicles:[{id:1,archived:true},{id:2},{id:3}],orders:[{id:4,order_items:[{document:{text:'România'}}]}],empty:[]};
 let active=0,maxActive=0;
 const body=await personalExport(Object.keys(records),metadata,async(table,start,size,abort)=>{
  assert.equal(abort.aborted,false);active++;maxActive=Math.max(maxActive,active);
  await Promise.resolve();active--;return {data:records[table].slice(start,start+size),error:null};
 },signal(),limits);
 assert.deepEqual(JSON.parse(body),{...metadata,...records});assert.equal(maxActive,1);
});

test('row budget is shared across tables; exact boundary succeeds and additional row fails',async()=>{
 const read=(more:boolean)=>async(table:string,start:number,size:number)=>({data:(table==='first'?[1,2,3,4]:more?[5]:[]).slice(start,start+size),error:null});
 assert.deepEqual(JSON.parse(await personalExport(['first','second'],metadata,read(false),signal(),{...limits,maxRows:4})).first,[1,2,3,4]);
 await assert.rejects(personalExport(['first','second'],metadata,read(true),signal(),{...limits,maxRows:4}),ExportLimitError);
});

test('byte budget includes UTF-8, nested JSON, metadata and delimiters across tables',async()=>{
 const records:Record<string,unknown[]>={first:[{nested:{text:'🚘ț'.repeat(20)}}],second:[{text:'é'.repeat(30)}]};
 const read=async(table:string,start:number,size:number)=>({data:records[table].slice(start,start+size),error:null});
 const body=await personalExport(['first','second'],metadata,read,signal(),limits);
 const size=new TextEncoder().encode(body).length;assert.ok(size>body.length);
 assert.equal(await personalExport(['first','second'],metadata,read,signal(),{...limits,maxBytes:size}),body);
 await assert.rejects(personalExport(['first','second'],metadata,read,signal(),{...limits,maxBytes:size-1}),ExportLimitError);
});

test('export-wide deadline aborts the in-flight read and does not start another table',async()=>{
 let calls=0,aborted=false;
 await assert.rejects(personalExport(['first','second'],metadata,async(_table,_start,_size,abort)=>{
  calls++;return await new Promise<never>((_resolve,reject)=>abort.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));},{once:true}));
 },signal(),{...limits,timeoutMs:10}));
 assert.equal(calls,1);assert.equal(aborted,true);
});

test('cancellation, returned database errors and thrown errors never produce partial success',async()=>{
 const aborted=new AbortController();aborted.abort();
 await assert.rejects(personalExport(['first'],metadata,async()=>assert.fail('read after cancellation'),aborted.signal,limits));
 for(const read of [async()=>({data:null,error:{message:'private database detail'}}),async()=>{throw Error('transport failure');}]){
  await assert.rejects(personalExport(['first'],metadata,read,signal(),limits));
 }
});
