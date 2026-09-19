import {z} from 'zod';
import {supabaseServer} from '../../../../../lib/supabase/server';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const db=await supabaseServer();const {data:{user}}=await db.auth.getUser();
 if(!user)return new Response('Autentificare necesară',{status:401,headers});
 const {id}=await params;if(!z.uuid().safeParse(id).success)return new Response('Indisponibil',{status:404,headers});
 const {data,error}=await db.from('order_items').select('document_text,status').eq('id',id).single();
 if(error||data?.status!=='issued'||!data.document_text)return new Response('Indisponibil',{status:404,headers});
 return new Response(data.document_text,{headers:{...headers,'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="simulare-vignexo.txt"'}});
}
