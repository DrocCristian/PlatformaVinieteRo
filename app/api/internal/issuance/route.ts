import {timingSafeEqual} from 'node:crypto';
import {commerceConfigured,supabaseAdmin} from '../../../../lib/supabase/admin';
import {mockProvider,supportedCountries,type Country,type Scenario} from '../../../../packages/domain/issuance';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!commerceConfigured())return Response.json({error:'Unavailable'},{status:503});
 const expected=Buffer.from('Bearer '+process.env.ISSUANCE_WORKER_SECRET);
 const actual=Buffer.from(request.headers.get('authorization')??'');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return Response.json({error:'Unauthorized'},{status:401});
 const db=supabaseAdmin();
 const recovery=await db.rpc('recover_test_jobs');
 if(recovery.error)return Response.json({error:'Recovery failed'},{status:500});
 const jobs=await db.rpc('claim_test_jobs',{p_limit:10});
 if(jobs.error)return Response.json({error:'Queue unavailable'},{status:500});
 let completed=0;
 for(const job of jobs.data??[]){
 const item=await db.from('order_items').select('*,orders(vehicle)').eq('id',job.item_id).single();
 if(item.error)continue; // The lease expires into manual review; never blindly re-issue.
 const row=item.data;
 const country=row.country as Country;
 if(!supportedCountries.includes(country)||row.provider!=='mock-'+country)continue;
 const scenario=(row.product_snapshot?.scenario??'timeout') as Scenario;
 if(!['success','refusal','timeout'].includes(scenario))continue;
 const provider=mockProvider(country);
 let result=await provider.issue({idempotencyKey:row.idempotency_key,country,plate:row.orders.vehicle.plate,scenario});
 if(result.status==='unconfirmed')result=await provider.getStatus(row.idempotency_key);
 const finish=await db.rpc('finish_test_job',{p_job:job.id,p_status:result.status,p_reference:result.reference??null,p_document:result.document??null});
 if(!finish.error)completed++;
 }
 return Response.json({completed},{headers:{'Cache-Control':'no-store'}});
}
