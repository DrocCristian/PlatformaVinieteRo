import 'server-only';
import {redirect,unstable_rethrow} from 'next/navigation';
import {supabaseServer} from './supabase/server';
import {startOperation} from './observability';
// Inspect only structured error metadata; messages can contain credentials or PII.
export function isAuthUpstreamFailure(error:unknown):boolean{
 if(!error||typeof error!=='object')return false;
 const value=error as {status?:unknown;name?:unknown;code?:unknown;cause?:unknown};
 if(typeof value.status==='number'&&(value.status>=500||value.status===429))return true;
 if(value.name==='AuthRetryableFetchError'||value.name==='FetchError'||value.name==='NetworkError')return true;
 const codes=['request_timeout','over_request_rate_limit','over_email_send_rate_limit','ECONNRESET','ECONNREFUSED','ENOTFOUND','EAI_AGAIN','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET'];
 if(typeof value.code==='string'&&codes.includes(value.code))return true;
 const cause=value.cause;
 return !!cause&&typeof cause==='object'&&'code' in cause&&typeof cause.code==='string'&&codes.includes(cause.code);
}
export async function currentUser(){
 const trace=startOperation('auth.session');
 try{
  const db=await supabaseServer();
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user){const upstream=isAuthUpstreamFailure(error);trace.finish(upstream?'error':'denied',upstream?'upstream_unavailable':'authentication_failed',{error});redirect('/autentificare');}
  trace.finish('success','completed');
  return {db,user};
 }catch(error){unstable_rethrow(error);trace.finish('error',isAuthUpstreamFailure(error)?'upstream_unavailable':'unexpected_error',{error});throw error;}
}
