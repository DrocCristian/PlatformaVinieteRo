import {NextResponse,type NextRequest} from 'next/server';
import {supabaseServer} from '../../../lib/supabase/server';
import {safeReturnPath} from '../../../packages/domain/account';
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code');
 const base=process.env.APP_URL ?? 'http://127.0.0.1:3000';
 let path='/autentificare?error=callback';
 if(code){try{const db=await supabaseServer();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)path=safeReturnPath(request.nextUrl.searchParams.get('next'));}catch{}}
 const response=NextResponse.redirect(new URL(path,base));
 response.headers.set('Cache-Control','private, no-store');
 response.headers.set('Referrer-Policy','no-referrer');
 return response;
}