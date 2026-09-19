import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request: NextRequest) {
 let response = NextResponse.next({request});
 response.headers.set('Cache-Control','private, no-store');
 if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) return response;
 const supabase = createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.APP_URL?.startsWith('https://') ?? false,path:'/'},
  cookies:{
   getAll:()=>request.cookies.getAll(),
   setAll:(items,headers)=>{
    items.forEach(({name,value})=>request.cookies.set(name,value));
    response=NextResponse.next({request});
    items.forEach(({name,value,options})=>response.cookies.set(name,value,options));
    Object.entries(headers ?? {}).forEach(([name,value])=>response.headers.set(name,value));
    response.headers.set('Cache-Control','private, no-store');
   }
  }
 });
 await supabase.auth.getUser();
 return response;
}
export const config={matcher:['/cont/:path*','/autentificare','/inregistrare','/recuperare','/auth/:path*']};
