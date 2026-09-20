import {timingSafeEqual} from 'node:crypto';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {startOperation} from '../../../../lib/observability';
import {mockProvider,supportedCountries,type Country,type Scenario} from '../../../../packages/domain/issuance';
import {runIssuanceBatch,batchStatus,type ItemResult} from '../../../../packages/domain/issuance-batch';
export const runtime='nodejs';
export async function POST(request:Request){
 const trace=startOperation('issuance.batch');
 const respond=(body:object,status=200)=>Response.json({...body,requestId:trace.requestId},{status,headers:{'Cache-Control':'no-store','X-Request-ID':trace.requestId}});
 if(!commerceConfigured()){trace.finish('ignored','configuration_missing');return respond({error:'Unavailable'},503);}
 const expected=Buffer.from('Bearer '+process.env.ISSUANCE_WORKER_SECRET);
 const actual=Buffer.from(request.headers.get('authorization')??'');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){trace.finish('denied','authentication_failed');return respond({error:'Unauthorized'},401);}
 try{
  const db=supabaseAdmin();
  const recovery=await db.rpc('recover_test_jobs');
  if(recovery.error){trace.finish('error','recovery_failed',{error:recovery.error});return respond({error:'Recovery failed'},500);}
  const jobs=await db.rpc('claim_test_jobs',{p_limit:10});
  if(jobs.error){trace.finish('error','queue_failed',{error:jobs.error});return respond({error:'Queue unavailable'},500);}
  const counts=await runIssuanceBatch(jobs.data??[],async(job:{id:string;item_id:string}):Promise<ItemResult>=>{
   const itemTrace=startOperation('issuance.item');
   let result:ItemResult;
   try{
    const item=await db.from('order_items').select('*,orders(vehicle)').eq('id',job.item_id).single();
    const row=item.data;
    if(item.error||!row)result={ok:false,code:'item_read_failed',error:item.error};
    else{
     const country=row.country as Country;
     const scenario=(row.product_snapshot?.scenario??'timeout') as Scenario;
     if(!supportedCountries.includes(country)||row.provider!=='mock-'+country||!['success','refusal','timeout'].includes(scenario)||typeof row.orders?.vehicle?.plate!=='string'||!row.orders.vehicle.plate||typeof row.idempotency_key!=='string'||!row.idempotency_key)result={ok:false,code:'item_invalid'};
     else{
      const provider=mockProvider(country);
      let issued=await provider.issue({idempotencyKey:row.idempotency_key,country,plate:row.orders.vehicle.plate,scenario});
      if(issued.status==='unconfirmed')issued=await provider.getStatus(row.idempotency_key);
      const finish=await db.rpc('finish_test_job',{p_job:job.id,p_status:issued.status,p_reference:issued.reference??null,p_document:issued.document??null});
      result=finish.error?{ok:false,code:'finalize_failed',error:finish.error}:{ok:true,status:issued.status};
     }
    }
   }catch(error){result={ok:false,code:'provider_failed',error};}
   // A failed item keeps its existing lease for manual review, never blind re-issuance.
   if(!result.ok)itemTrace.finish('error',result.code,{error:result.error});
   else itemTrace.finish(result.status==='unconfirmed'?'pending':result.status==='rejected'?'denied':'success',result.status==='unconfirmed'?'manual_review':result.status==='rejected'?'provider_rejected':'completed');
   return result;
  });
  trace.finish(counts.failed?'error':counts.manualReview?'pending':'success',counts.failed?'partial_failure':counts.manualReview?'manual_review':'completed',{counts});
  return respond(counts,batchStatus(counts));
 }catch(error){trace.finish('error','unexpected_error',{error});return respond({error:'Processing unavailable'},500);}
}
