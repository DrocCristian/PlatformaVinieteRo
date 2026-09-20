// Only explicitly permitted operational fields may cross the logging boundary.
export const operations=['auth.sign_in','auth.sign_up','auth.recover','auth.sign_out','auth.change_password','auth.session','auth.callback','profile.save','vehicle.save','vehicle.archive','journey.save','journey.archive','route.save','support.create','preferences.save','checkout.create','stripe.webhook','issuance.batch','issuance.item','server.request'] as const;
export type Operation=(typeof operations)[number];
export const outcomes=['success','pending','invalid','denied','error','ignored'] as const;
export type Outcome=(typeof outcomes)[number];
export const codes=['completed','confirmation_pending','validation_failed','authentication_failed','not_found','conflict','upstream_unavailable','persistence_failed','unexpected_error','configuration_missing','callback_missing','callback_failed','signature_invalid','live_event_rejected','event_ignored','payment_pending','payment_confirmed','payment_duplicate','checkout_expired','payment_failed','recovery_failed','queue_failed','item_read_failed','item_invalid','provider_failed','finalize_failed','partial_failure','manual_review','provider_rejected'] as const;
export type DiagnosticCode=(typeof codes)[number];
const providerCodes=new Set(['invalid_credentials','email_not_confirmed','over_email_send_rate_limit','over_request_rate_limit','request_timeout','user_banned','session_not_found','refresh_token_not_found','refresh_token_already_used','otp_expired','bad_code_verifier','flow_state_expired','23505','23503','23514','42501','PGRST116','PGRST301','rate_limit','api_connection_error','api_error']);
export type Counts={claimed:number;completed:number;failed:number;manualReview:number;rejected:number};
export type DiagnosticDetails={error?:unknown;counts?:Counts;digest?:unknown;routeType?:unknown};
export type DiagnosticRecord={schema_version:1;event:'operation_finished';operation:Operation;outcome:Outcome;code:DiagnosticCode;request_id:string;duration_ms:number;timestamp:string;provider_code?:string;upstream_status?:number;counts?:Counts;digest?:string;route_type?:string};
function safeError(error:unknown){
 const result:{provider_code?:string;upstream_status?:number}={};
 try{if(error&&typeof error==='object'){
  const e=error as {code?:unknown;status?:unknown;statusCode?:unknown};
  if(typeof e.code==='string'&&providerCodes.has(e.code))result.provider_code=e.code;
  const status=e.status??e.statusCode;
  if(typeof status==='number'&&Number.isInteger(status)&&status>=400&&status<=599)result.upstream_status=status;
 }}catch{/* A malformed error must never break the original operation. */}
 return result;
}
export function safeDigest(value:unknown){return typeof value==='string'&&/^\d{1,20}$/.test(value)?value:undefined;}
export function createOperation(operation:Operation,emit:(record:DiagnosticRecord)=>void,clock=Date.now){
 const requestId=crypto.randomUUID();const started=clock();let finished=false;
 return {requestId,finish(outcome:Outcome,code:DiagnosticCode,details:DiagnosticDetails={}){
  if(finished)return;finished=true;
  try{
   const now=clock();
   const record:DiagnosticRecord={schema_version:1,event:'operation_finished',operation:operations.includes(operation)?operation:'server.request',outcome:outcomes.includes(outcome)?outcome:'error',code:codes.includes(code)?code:'unexpected_error',request_id:requestId,duration_ms:Math.max(0,Math.min(86400000,Math.round(now-started))),timestamp:new Date(now).toISOString(),...safeError(details.error)};
   const digest=safeDigest(details.digest);if(digest)record.digest=digest;
   if(typeof details.routeType==='string'&&['render','route','action','proxy'].includes(details.routeType))record.route_type=details.routeType;
   if(details.counts){record.counts={claimed:0,completed:0,failed:0,manualReview:0,rejected:0};for(const key of Object.keys(record.counts) as (keyof Counts)[]){const n=details.counts[key];record.counts[key]=Number.isSafeInteger(n)&&n>=0&&n<=10000?n:0;}}
   emit(record);
  }catch{/* Observability must not alter payments, authentication or persistence. */}
 }};
}
