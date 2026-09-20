import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildReport,reportCsv,planInvoices,snapshotBatch,fleetAssetSchema,type FleetAsset,type LedgerLine} from '../../packages/domain/fleet.ts';
import {checkoutBlockers} from '../../packages/domain/fleet-compliance.ts';
const c='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002';
const v='20000000-0000-4000-8000-000000000001',t='20000000-0000-4000-8000-000000000002';
const asset:FleetAsset={id:v,company_id:c,plate:'TM01ABC',registration_country:'RO',label:'',kind:'tractor',f1:18000,f2:18000,f3:40000,axles:2,euro:'6',co2_class:1};
const trailer:FleetAsset={...asset,id:t,kind:'semitrailer',plate:'TM02ABC',f1:34000,f2:34000,f3:null,axles:3};
const batch={company_id:c,title:'Cursă',countries:['AT'],start:'2026-10-01',end:'2026-10-05',vehicles:[{vehicle_id:v,trailer_id:t}]};
test('snapshot stores tractor and semitrailer independently without summing coupling loads',()=>{
 const out=snapshotBatch(batch,[asset,trailer]);assert.equal(out.vehicles[0].vehicle.f3,40000);assert.equal(out.vehicles[0].trailer?.f1,34000);
 assert.equal(out.payment_mode,'immediate');
});
test('rejects foreign assets and duplicate trailers',()=>{
 assert.throws(()=>snapshotBatch(batch,[asset,{...trailer,company_id:other}]));
 assert.throws(()=>snapshotBatch({...batch,vehicles:[...batch.vehicles,{vehicle_id:t,trailer_id:t}]},[asset,trailer]));
 assert.throws(()=>snapshotBatch(batch,[{...asset,kind:'car'},trailer]));
});
test('validates dates and technical data',()=>{
 assert.throws(()=>snapshotBatch({...batch,start:'2026-02-30'},[asset,trailer]));
 assert.equal(fleetAssetSchema.safeParse({...asset,f2:19000}).success,false);
});
const lines:LedgerLine[]=[
 {id:'1',companyId:c,vehicleId:v,plate:'TM01ABC',date:'2026-09-01',country:'AT',description:'Taxă',currency:'EUR',grossMinor:1500,invoiceReference:'F1'},
 {id:'2',companyId:c,vehicleId:t,plate:'TM02ABC',date:'2026-09-02',country:'RO',description:'Taxă',currency:'RON',grossMinor:2000,invoiceReference:'F2'},
 {id:'3',companyId:other,vehicleId:v,plate:'PRIVATE',date:'2026-09-01',country:'AT',description:'Taxă',currency:'EUR',grossMinor:99999,invoiceReference:'F3'}
];
test('statement filters tenant and dates, preserves separate currencies and is not fiscal',()=>{
 const report=buildReport(lines,{companyId:c,from:'2026-09-01',to:'2026-09-30',vehicleIds:[],groupBy:'fleet'});
 assert.equal(report.lines.length,2);assert.equal(report.groups.length,2);assert.equal(report.fiscalInvoice,false);
 assert.deepEqual(report.groups.map(g=>g.grossMinor),[1500,2000]);
 const filtered=buildReport(lines,{...report.filter,vehicleIds:[v]});assert.equal(filtered.lines.length,1);
});
test('CSV neutralises spreadsheet formulas',()=>{
 const r=buildReport([{...lines[0],description:'=HYPERLINK("bad")'}],{companyId:c,from:'2026-01-01',to:'2026-12-31',vehicleIds:[],groupBy:'vehicle'});
 assert.ok(reportCsv(r).includes("'=HYPERLINK"));
});
test('one invoice can contain multiple vehicles, but not multiple issuers or currencies',()=>{
 const base={id:'1',companyId:c,issuerId:'vignexo',currency:'EUR',invoiceId:null,model:'reseller' as const,taxReviewed:true};
 assert.equal(planInvoices([base,{...base,id:'2'}]).length,1);
 assert.equal(planInvoices([base,{...base,id:'2',issuerId:'supplier'}]).length,2);
 assert.equal(planInvoices([base,{...base,id:'2',currency:'RON'}]).length,2);
 assert.throws(()=>planInvoices([{...base,invoiceId:'existing'}]));
 assert.throws(()=>planInvoices([{...base,taxReviewed:false}]));
 assert.throws(()=>planInvoices([base,{...base,id:'2',companyId:other}]));
});
test('checkout stays blocked without product-specific legal, tax, contract and technical approvals',()=>{
 assert.equal(checkoutBlockers([],[{country:'AT',product:'GO',start:'2026-10-01',end:'2026-10-02'}]).length,1);
 const a={country:'AT',product:'GO',ruleVersion:'v1',source:'https://www.asfinag.at',validFrom:'2026-01-01',validUntil:'2026-12-31',legalReview:'approved' as const,contract:'approved' as const,taxReview:'approved' as const,integration:'certified' as const};
 assert.deepEqual(checkoutBlockers([a],[{country:'AT',product:'GO',start:'2026-10-01',end:'2026-10-02'}]),[]);
 assert.equal(checkoutBlockers([a],[{country:'AT',product:'vignette',start:'2026-10-01',end:'2026-10-02'}]).length,1);
 assert.equal(checkoutBlockers([a],[{country:'AT',product:'GO',start:'2026-12-31',end:'2027-01-01'}]).length,1);
});
