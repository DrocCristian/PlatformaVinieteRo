import {NextResponse} from 'next/server';
import {currentUser} from '../../../../lib/current-user';
import {buildReport,reportCsv,reportSchema,type LedgerLine} from '../../../../packages/domain/fleet';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request){
 const {db,user}=await currentUser();
 if(process.env.FLEET_WORKSPACE_ENABLED!=='true')return NextResponse.json({error:'Funcția nu este activă.'},{status:503,headers});
 const q=new URL(request.url).searchParams;
 const parsed=reportSchema.safeParse({companyId:q.get('companyId'),from:q.get('from'),to:q.get('to'),groupBy:q.get('groupBy')??'vehicle',vehicleIds:q.get('vehicle')?[q.get('vehicle')]:[]});
 if(!parsed.success)return NextResponse.json({error:'Verifică firma, vehiculul și perioada.'},{status:400,headers});
 const f=parsed.data;
 const company=await db.from('fleet_companies').select('id').eq('id',f.companyId).eq('owner_id',user.id).maybeSingle();
 if(company.error||!company.data)return NextResponse.json({error:'Firma nu este disponibilă.'},{status:404,headers});
 let query=db.from('fleet_ledger').select('id,company_id,vehicle_id,plate_snapshot,posting_date,country,description,currency,gross_minor,invoice_reference',{count:'exact'}).eq('company_id',f.companyId).gte('posting_date',f.from).lte('posting_date',f.to).order('posting_date').order('id').limit(1001);
 if(f.vehicleIds.length)query=query.in('vehicle_id',f.vehicleIds);
 const {data,error,count}=await query;
 if(error)return NextResponse.json({error:'Raportul nu a putut fi încărcat.'},{status:503,headers});
 if((count??data.length)>1000)return NextResponse.json({error:'Alege un interval mai scurt. Exportul acestei versiuni este limitat la 1.000 de poziții.'},{status:413,headers});
 const lines:LedgerLine[]=data.map(l=>({id:l.id,companyId:l.company_id,vehicleId:l.vehicle_id,plate:l.plate_snapshot,date:l.posting_date,country:l.country,description:l.description,currency:l.currency,grossMinor:Number(l.gross_minor),invoiceReference:l.invoice_reference}));
 try{return new Response(reportCsv(buildReport(lines,f)),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="raport-flota.csv"'}});}
 catch{return NextResponse.json({error:'Datele financiare necesită verificare.'},{status:422,headers});}
}
