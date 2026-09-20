import {NextResponse,type NextRequest} from 'next/server';
import {unstable_rethrow} from 'next/navigation';
import {supabaseServer} from '../../../lib/supabase/server';
import {safeReturnPath} from '../../../packages/domain/account';
import {startOperation} from '../../../lib/observability';
export async function GET(request:NextRequest){
 const trace=startOperation('auth.callback');
 const code=request.nextUrl.searchParams.get('code');
 const base=process.env.APP_URL ?? 'http://127.0.0.1:3000';
 let path='/autentificare?error=callback';
 if(code){
  try{
   const db=await supabaseServer();
   const {error}=await db.auth.exchangeCodeForSession(code);
   if(error)trace.finish('error','callback_failed',{error});
   else{path=safeReturnPath(request.nextUrl.searchParams.get('next'));trace.finish('success','completed');}
  }catch(error){unstable_rethrow(error);trace.finish('error','callback_failed',{error});}
 }else trace.finish('invalid','callback_missing');
 const response=NextResponse.redirect(new URL(path,base));
 response.headers.set('Cache-Control','private, no-store');
 response.headers.set('Referrer-Policy','no-referrer');
 response.headers.set('X-Request-ID',trace.requestId);
 return response;
}
