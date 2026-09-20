import PurchaseWorkspace from '../../../components/purchase-workspace';
import {fleetPurchaseVehicle} from '../../../packages/domain/purchase-workspace';
import '../demo/style.css';
export const metadata={title:'Vignexo — demonstrație comandă comună',robots:{index:false,follow:false}};
const company='10000000-0000-4000-8000-000000000001';
const base={company_id:company,registration_country:'RO',f1:3000,f2:3000,f3:5000,axles:2,euro:'6',co2_class:null,identity:{vin:'WVWZZZ1JZXW000001',legacyVin:false}};
const assets=[
 {...base,id:'20000000-0000-4000-8000-000000000001',plate:'TM01DEMO',label:'Mașina de serviciu',kind:'car'},
 {...base,id:'20000000-0000-4000-8000-000000000002',plate:'TM02DEMO',label:'Autoutilitară',kind:'van',identity:{vin:'WVWZZZ1JZXW000002',legacyVin:false}},
 {...base,id:'20000000-0000-4000-8000-000000000003',plate:'TM03DEMO',label:'Cap tractor',kind:'tractor',f1:18000,f2:18000,f3:40000},
 {...base,id:'20000000-0000-4000-8000-000000000004',plate:'TM04DEMO',label:'Semiremorcă',kind:'semitrailer',f1:34000,f2:34000,f3:null,axles:3}
].map(fleetPurchaseVehicle);
export default function Page(){return <PurchaseWorkspace assets={assets} companyId={company} demo/>;}
