import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyTechnical,technicalSchema,weightBand} from '../../packages/domain/vehicle-profile.ts';
import {assessTolls} from '../../packages/domain/toll-rules.ts';
import {pendingRouteQuote,routeRequestSchema} from '../../packages/domain/route-request.ts';
const car={...emptyTechnical(),category:'M1' as const,f1:2500,f2:2500,seats:5};
const trailer={plate:'B123REM',country:'RO',category:'O2' as const,f1:1500,f2:1500,axles:2};
const date='2026-09-25';
test('3.5 tonne boundary includes exactly 3500 and never treats missing as light',()=>{
 assert.equal(weightBand(null),'unknown');assert.equal(weightBand(3499),'light');assert.equal(weightBand(3500),'light');assert.equal(weightBand(3501),'heavy');
 for(const mass of [3499,3500,3501])assert.equal(assessTolls('AT',{...car,f1:mass,f2:mass},'RO',date).system,mass<=3500?'vignette':'GO-Maut');
});
test('invalid masses/categories rejected; F1 and F2 remain distinct',()=>{
 for(const value of [{...car,f1:-1},{...car,f1:3500.5},{...car,f2:2600},{...car,kind:'goods'},{...car,kind:'goods',category:'N1',f1:3501},{...car,trailer:{...trailer,category:'O1'}}])assert.equal(technicalSchema.safeParse(value).success,false);
 assert.equal(assessTolls('AT',{...car,f1:4000,f2:3500},'RO',date).system,'review');
});
test('Hungary trailer depends on D1 versus D2, including 2026 heavy motorhomes',()=>{
 assert.equal(assessTolls('HU',{...car,trailer},'RO',date).trailer,'included');
 const van={...car,kind:'goods' as const,category:'N1' as const,trailer};
 assert.equal(assessTolls('HU',van,'RO',date).vehicleClass,'D2');
 assert.equal(assessTolls('HU',van,'RO',date).trailer,'separate');
 assert.equal(assessTolls('HU',{...car,seats:8},'RO',date).vehicleClass,'D2');
 assert.equal(assessTolls('HU',{...car,kind:'motorhome',f1:4500,f2:4500},'RO',date).system,'vignette');
 assert.equal(assessTolls('HU',{...car,kind:'goods',category:'N2',f1:4500,f2:4500},'RO',date).system,'HU-GO');
});
test('trailer combined threshold and country distinctions',()=>{
 for(const country of ['BG','SK']){
  assert.equal(assessTolls(country,{...car,f1:2000,f2:2000,trailer},'RO',date).trailer,'included');
  assert.equal(assessTolls(country,{...car,f1:2001,f2:2001,trailer},'RO',date).trailer,'separate');
 }
 assert.equal(assessTolls('CZ',{...car,trailer},'RO',date).trailer,'included');
 assert.equal(assessTolls('AT',{...car,trailer},'RO',date).trailer,'included');
 assert.equal(assessTolls('CH',{...car,trailer},'RO',date).trailer,'separate');
 assert.equal(assessTolls('SK',{...car,f1:4500,f2:4500},'RO',date).system,'vignette');
 assert.equal(assessTolls('SK',{...car,trailer:{...trailer,category:'unknown'}},'RO',date).needsReview,true);
});
test('Romania uses trip date and blocks a trip crossing the regime change',()=>{
 const truck={...car,kind:'goods',category:'N3',f1:18000,f2:18000};
 assert.equal(assessTolls('RO',truck,'RO','2026-09-30').system,'rovinieta');
 assert.equal(assessTolls('RO',truck,'RO','2026-10-01').system,'TollRo');
 assert.equal(assessTolls('RO',truck,'RO','2026-09-30','2026-10-02').system,'review');
});
test('uncertainty and missing providers cannot become a payable quote',()=>{
 for(const c of ['AT','HU','RO','BG','CZ','SK','SI','CH','MD','DE','IT','XX']){
  const r=assessTolls(c,car,'RO',date);
  assert.equal(r.payable,false);assert.equal(r.totalMinor,null);
  assert.equal(assessTolls(c,car,'RO','2027-01-01').needsReview,true);
 }
 assert.equal(assessTolls('SI',{...car,frontHeightMm:1300},'RO',date).system,'review');
 assert.equal(assessTolls('MD',car,'MD',date).system,'review');
 assert.equal(pendingRouteQuote().totalMinor,null);assert.equal(pendingRouteQuote().canPay,false);
 assert.equal(routeRequestSchema.safeParse({origin:'Cluj',destination:'Viena',departure:'2099-01-02',returnDate:'2099-01-01'}).success,false);
 assert.equal(routeRequestSchema.safeParse({origin:'Cluj',destination:' cluj ',departure:'2099-01-02',returnDate:'2099-01-02'}).success,false);
});
