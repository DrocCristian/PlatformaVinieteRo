import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function supabaseServer() {
 const jar = await cookies();
 return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
  cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.APP_URL?.startsWith('https://') ?? false, path: '/' },
  cookies: {
   getAll: () => jar.getAll(),
   setAll: (items) => { try { items.forEach(({name,value,options})=>jar.set(name,value,options)); } catch { /* Server Components are read-only; proxy refreshes cookies. */ } }
  }
 });
}
