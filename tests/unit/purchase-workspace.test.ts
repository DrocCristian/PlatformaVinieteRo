import {test} from 'node:test';
import assert from 'node:assert/strict';
import {snapshotPurchaseBasket,personalPurchaseVehicle,fleetPurchaseVehicle} from '../../packages/domain/purchase-workspace.ts';
import {vinIdentitySchema} from '../../packages/domain/vehicle-identity.ts';
import {emptyTechnical,technicalSchema} from '../../packages/domain/vehicle-profile.ts';
const id='20000000-0000-4000-8000-000000000001',company='10000000-0000-4000-8000-000000000001';
const selection={country:'RO',duration:'d10',start:'2026-10-01',time:'',year:'2026'};
const entry={vehicleId:id,trailerId:null,selections:[selection],route:{from:'',to:'',via:''},notify:false};
const basket={companyId:null,title:'Test order',entries:[entry]};
const asset=personalPurchaseVehicle({id,plate:'TM12ABC',registration_country:'RO',label:'',technical:{...emptyTechnical(),f1:3000,identity:{vin:'WVWZZZ1JZXW000001',legacyVin:false}}});
test('saved VIN is validated, legacy VIN explicit, old profiles remain readable',()=>{
 assert.equal(vinIdentitySchema.safeParse({vin:'SHORT'}).success,false);
 assert.equal(vinIdentitySchema.safeParse({vin:'SHORT',legacyVin:true}).success,true);
 assert.equal(technicalSchema.safeParse(emptyTechnical()).success,true);
});
test('snapshot reads server asset identity and never accepts client price or payment flags',()=>{
 const out=snapshotPurchaseBasket({...basket,totalMinor:1,paymentEnabled:true},[asset],'2026-09-20');
 assert.equal(out.entries[0].vehicle.vin,'WVWZZZ1JZXW000001');assert.equal(out.totalMinor,null);assert.equal(out.paymentEnabled,false);
 assert.equal(out.entries[0].notify,false);
});
test('rejects wrong account, wrong company, duplicate vehicle, stale date and missing VIN',()=>{
 assert.throws(()=>snapshotPurchaseBasket(basket,[],'2026-09-20'));
 assert.throws(()=>snapshotPurchaseBasket({...basket,companyId:company},[asset],'2026-09-20'));
 assert.throws(()=>snapshotPurchaseBasket({...basket,entries:[entry,entry]},[asset],'2026-09-20'));
 assert.throws(()=>snapshotPurchaseBasket(basket,[asset],'2026-10-02'));
 assert.throws(()=>snapshotPurchaseBasket(basket,[{...asset,vin:''}],'2026-09-20'));
});
test('unknown mass goes to technical review, not automatic light classification',()=>{
 const unknown=personalPurchaseVehicle({id,plate:'TEST',registration_country:'RO',label:'',technical:emptyTechnical()});
 assert.equal(unknown.vehicle,'other');
 assert.throws(()=>snapshotPurchaseBasket(basket,[unknown],'2026-09-20'));
});
test('heavy combination requires route and trailer from same company, preserves individual masses',()=>{
 const motor=fleetPurchaseVehicle({id,company_id:company,plate:'TM01ABC',registration_country:'RO',label:'',kind:'tractor',identity:{vin:'WVWZZZ1JZXW000001'},f1:18000,f2:18000,f3:40000,axles:2,euro:'6',co2_class:1});
 const trailer={...motor,id:'20000000-0000-4000-8000-000000000002',kind:'semitrailer',technical:{f1:'34000'}};
 const input={...basket,companyId:company,entries:[{...entry,trailerId:trailer.id,selections:[{...selection,country:'AT',duration:''}],route:{from:'Vienna',to:'Budapest',via:''}}]};
 const out=snapshotPurchaseBasket(input,[motor,trailer],'2026-09-20');
 assert.equal(out.entries[0].vehicle.technical.f3,'40000');assert.equal(out.entries[0].vehicle.trailer?.id,trailer.id);
 assert.throws(()=>snapshotPurchaseBasket(input,[motor,{...trailer,companyId:null}],'2026-09-20'));
 assert.throws(()=>snapshotPurchaseBasket({...input,entries:[{...input.entries[0],route:{from:'',to:'',via:''}}]},[motor,trailer],'2026-09-20'));
});
