import 'server-only';
import {currentUser} from './current-user';
import {personalPurchaseVehicle,fleetPurchaseVehicle} from '../packages/domain/purchase-workspace';
export async function purchaseContext(companyId:string|null){
 const {db,user}=await currentUser();
 if(process.env.PURCHASE_WORKSPACE_ENABLED!=='true')throw Error('Spațiul de cumpărare nu este încă activ.');
 if(companyId){
  if(process.env.FLEET_WORKSPACE_ENABLED!=='true')throw Error('Spațiul firmelor nu este încă activ.');
  const company=await db.from('fleet_companies').select('id,name,tax_id,country,billing_address,billing_email').eq('id',companyId).eq('owner_id',user.id).maybeSingle();
  if(company.error||!company.data)throw Error('Firma nu este disponibilă în contul tău.');
  const assets=await db.from('fleet_assets').select('id,company_id,plate,registration_country,label,kind,identity,f1,f2,f3,axles,euro,co2_class').eq('company_id',companyId).is('archived_at',null).limit(101);
  if(assets.error||!assets.data||assets.data.length>100)throw Error('Flota nu poate fi încărcată complet (maximum 100 de vehicule).');
  return {db,user,buyer:company.data,assets:assets.data.map(fleetPurchaseVehicle)};
 }
 const assets=await db.from('vehicles').select('id,plate,registration_country,label,technical').eq('user_id',user.id).is('archived_at',null).limit(101);
 if(assets.error||!assets.data||assets.data.length>100)throw Error('Vehiculele nu pot fi încărcate complet (maximum 100).');
 return {db,user,buyer:null,assets:assets.data.map(personalPurchaseVehicle)};
}
