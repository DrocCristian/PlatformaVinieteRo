import {supabaseServer} from '../../../../lib/supabase/server';
export async function GET(){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const db=await supabaseServer();const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return Response.json({error:'Autentificare necesară.'},{status:401,headers});
 const tables=['profiles','vehicles','journeys','support_cases','notification_preferences','orders','service_subscriptions','renewal_mandates','purchase_drafts','fleet_companies','fleet_assets','fleet_purchase_drafts','fleet_documents','fleet_ledger'] as const;
 const results=await Promise.all(tables.map(async t=>{
 const rows:unknown[]=[];
 for(let start=0;;start+=1000){
 let query=db.from(t).select(t==='orders'?'*,order_items(*)':'*');
 // Child fleet tables are scoped to the authenticated company owner by RLS.
 if(t==='fleet_companies')query=query.eq('owner_id',user.id);
 else if(!t.startsWith('fleet_'))query=query.eq(t==='profiles'?'id':'user_id',user.id);
 const result=await query.order(t==='notification_preferences'?'user_id':'id').range(start,start+999);
 if(result.error)return {error:true,data:null};
 rows.push(...(result.data??[]));if((result.data?.length??0)<1000)break;
 }
 return {error:false,data:rows};
 }));
 if(results.some(r=>r.error))return Response.json({error:'Exportul nu a putut fi generat.'},{status:503,headers});
 return Response.json({exported_at:new Date().toISOString(),account:{id:user.id,email:user.email},...Object.fromEntries(tables.map((t,i)=>[t,results[i].data]))},{headers:{...headers,'Content-Disposition':'attachment; filename="vignexo-date-personale.json"'}});
}
