import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previewValidity,validatePurchaseTechnical} from '../../packages/domain/purchase-validity.ts';
import type {Selection} from '../../packages/domain/purchase-preview.ts';
const selection=(country:Selection['country'],duration:string,start:string,year='2026'):Selection=>({country,duration,start,year,time:''});
test('calendar days include start, cross leap day and year without timezone drift',()=>{
 assert.equal(previewValidity(selection('SK','d10','2028-02-25'),'car')?.end,'2028-03-05');
 assert.equal(previewValidity(selection('RO','d30','2026-12-20'),'car')?.end,'2027-01-18');
 assert.equal(previewValidity(selection('MD','d7','2026-10-01'),'car')?.end,'2026-10-07');
});
test('calendar months are not thirty-day products; fixed annuals reject uncovered travel',()=>{
 assert.equal(previewValidity(selection('HU','m1','2027-01-31'),'car')?.end,'2027-02-28');
 assert.equal(previewValidity(selection('AT','m2','2026-10-31'),'car')?.end,'2026-12-31');
 assert.equal(previewValidity(selection('AT','m2','2026-10-31'),'car')?.activationReview,true);
 assert.equal(previewValidity(selection('CH','annual','2026-10-01'),'car')?.end,'2027-01-31');
 assert.equal(previewValidity(selection('CH','annual','2027-02-01'),'car'),null);
 assert.equal(previewValidity(selection('SI','year','2026-10-01'),'car')?.end,'2027-10-01');
 assert.equal(previewValidity(selection('CZ','year','2027-03-01'),'car')?.end,'2028-02-29');
});
test('unverified boundaries stay pending and heavy products never yield light validity',()=>{
 assert.equal(previewValidity(selection('BG','d1','2026-10-25'),'car')?.end,null);
 assert.equal(previewValidity(selection('BG','weekend','2026-10-03'),'car')?.end,'2026-10-04');
 assert.equal(previewValidity(selection('RO','m12','2026-10-01'),'car')?.end,null);
 assert.equal(previewValidity(selection('AT','d10','2026-10-01'),'heavy'),null);
 assert.equal(previewValidity(selection('AT','d10','2026-02-30'),'car'),null);
});
test('technical errors identify relevant fields and enforce trailer and mass consistency',()=>{
 const p={category:'M1',f1:'3000',f2:'3000'};
 assert.deepEqual(validatePurchaseTechnical(p,'car',false,['AT']),{});
 assert.ok(validatePurchaseTechnical({...p,f2:'3500'},'car',false,['AT'])['technical-f2']);
 assert.ok(validatePurchaseTechnical({...p,f1:'4000'},'car',false,['AT'])['technical-f1']);
 assert.ok(validatePurchaseTechnical(p,'car',false,['HU'])['technical-seats']);
 assert.ok(validatePurchaseTechnical(p,'car',false,['CZ'])['technical-fuel']);
 assert.ok(validatePurchaseTechnical(p,'car',false,['SI'])['technical-frontHeightMm']);
 assert.ok(validatePurchaseTechnical({...p,'trailer-category':'O1','trailer-f1':'900','trailer-f2':'900'},'car',true,['SK'])['technical-trailer-f1']);
});
