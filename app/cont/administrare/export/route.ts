import {requireStaff} from '../../../../lib/staff';
export async function GET(){
 const {db}=await requireStaff(['superadmin','accounting']);
 const {data,error}=await db.from('orders').select('id,created_at,status,currency,total_minor').order('created_at',{ascending:false}).limit(10000);
 if(error)return new Response('Export indisponibil',{status:503});
 const rows=['id,created_at,status,currency,total_minor',...(data??[]).map(r=>[r.id,r.created_at,r.status,r.currency,r.total_minor].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))];
 return new Response(rows.join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="vignexo-comenzi-test.csv"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
