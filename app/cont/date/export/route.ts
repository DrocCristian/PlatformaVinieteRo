import {supabaseServer} from '../../../../lib/supabase/server';
import {personalExport,ExportLimitError} from '../../../../packages/domain/personal-export';
export async function GET(request:Request){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const db=await supabaseServer();const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return Response.json({error:'Autentificare necesară.'},{status:401,headers});
 const tables=['profiles','vehicles','journeys','support_cases','notification_preferences','orders','service_subscriptions','renewal_mandates','purchase_drafts','fleet_companies','fleet_assets','fleet_purchase_drafts','fleet_documents','fleet_ledger'] as const;
 try{
 const body=await personalExport(tables,{exported_at:new Date().toISOString(),account:{id:user.id,email:user.email}},async(t,start,size,signal)=>{
 let query=db.from(t).select(t==='orders'?'*,order_items(*)':'*');
 // Child fleet tables are scoped to the authenticated company owner by RLS.
 if(t==='fleet_companies')query=query.eq('owner_id',user.id);
 else if(!t.startsWith('fleet_'))query=query.eq(t==='profiles'?'id':'user_id',user.id);
 return await query.order(t==='notification_preferences'?'user_id':'id').range(start,start+size-1).abortSignal(signal);
 },request.signal);
 return new Response(body,{headers:{...headers,'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="vignexo-date-personale.json"'}});
 }catch(error){
 if(error instanceof ExportLimitError)return Response.json({error:'Datele depășesc limita descărcării directe. Solicită copia completă prin suport. Nu a fost generat un export parțial.',support:'/cont/suport'},{status:413,headers});
 return Response.json({error:'Exportul nu a putut fi generat. Reîncearcă sau solicită copia completă prin suport.',support:'/cont/suport'},{status:503,headers});
 }
}
