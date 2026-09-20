import type {Counts,DiagnosticCode} from './telemetry.ts';
import type {Outcome as IssuanceOutcome} from './issuance.ts';
export type ItemResult={ok:true;status:IssuanceOutcome}|{ok:false;code:DiagnosticCode;error?:unknown};
export async function runIssuanceBatch<T>(jobs:readonly T[],processJob:(job:T)=>Promise<ItemResult>){
 const counts:Counts={claimed:jobs.length,completed:0,failed:0,manualReview:0,rejected:0};
 for(const job of jobs){
  let result:ItemResult;
  try{result=await processJob(job);}catch(error){result={ok:false,code:'provider_failed',error};}
  if(result.ok){counts.completed++;if(result.status==='unconfirmed')counts.manualReview++;if(result.status==='rejected')counts.rejected++;}
  else counts.failed++;
 }
 return counts;
}
export function batchStatus(counts:Counts){return counts.failed>0?500:200;}
