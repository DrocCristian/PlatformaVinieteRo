import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availableDurations,validatePurchaseDraft,trailerGuidance,type PurchaseDraft} from '../../packages/domain/purchase-preview.ts';
const base:PurchaseDraft={plate:'TM 12 ABC',registration:'RO',vin:'',legacyVin:false,vehicle:'car',selections:[{country:'AT',duration:'d10',start:'2026-10-01',time:'',year:'2026'}]};
const today='2026-09-20';
test('country durations are distinct and heavy vehicles cannot buy a light vignette',()=>{
 assert.deepEqual(availableDurations('AT','car').map(p=>p.id),['d1','d10','m2','annual']);
 assert.deepEqual(availableDurations('SK','car').map(p=>p.id),['d1','d10','d30','d365']);
 assert.deepEqual(availableDurations('CH','car').map(p=>p.id),['annual']);
 assert.deepEqual(availableDurations('MD','van'),[]);
 for(const country of ['AT','HU','RO','BG','CZ','SK','SI','CH','MD'] as const)assert.deepEqual(availableDurations(country,'heavy'),[]);
});
test('unsupported duration, invalid dates, duplicate countries and empty cart are rejected',()=>{
 assert.deepEqual(validatePurchaseDraft(base,today),{});
 assert.ok(validatePurchaseDraft({...base,selections:[{...base.selections[0],duration:'m1'}]},today)['duration-AT']);
 assert.ok(validatePurchaseDraft({...base,selections:[{...base.selections[0],start:'2026-02-30'}]},today)['start-AT']);
 assert.ok(validatePurchaseDraft({...base,selections:[...base.selections,...base.selections]},today).countries);
 assert.ok(validatePurchaseDraft({...base,selections:[]},today).countries);
});
test('VIN follows destination and explicit legacy exception, never assumed required for Austria',()=>{
 const ro:PurchaseDraft={...base,selections:[{...base.selections[0],country:'RO'}]};
 assert.ok(validatePurchaseDraft(ro,today).vin);
 assert.equal(validatePurchaseDraft({...ro,vin:'WVWZZZ1JZXW000001'},today).vin,undefined);
 assert.ok(validatePurchaseDraft({...ro,vin:'WVWZZZ1JZXW00000I'},today).vin);
 assert.equal(validatePurchaseDraft({...ro,vin:'ABC12345',legacyVin:true},today).vin,undefined);
 assert.ok(validatePurchaseDraft({...ro,vin:'ABC12345'},today).vin);
});
test('BG daily requires local time and weekend is limited to Friday through Sunday',()=>{
 const bg:PurchaseDraft={...base,selections:[{...base.selections[0],country:'BG',duration:'d1'}]};
 assert.ok(validatePurchaseDraft(bg,today)['time-BG']);
 assert.equal(validatePurchaseDraft({...bg,selections:[{...bg.selections[0],time:'15:30'}]},today)['time-BG'],undefined);
 assert.ok(validatePurchaseDraft({...bg,selections:[{...bg.selections[0],duration:'weekend'}]},today)['start-BG']);
 assert.equal(validatePurchaseDraft({...bg,selections:[{...bg.selections[0],duration:'weekend',start:'2026-10-03'}]},today)['start-BG'],undefined);
});
test('annual product year must cover travel; trailer guidance is not universal',()=>{
 const annual:PurchaseDraft={...base,selections:[{...base.selections[0],country:'CH',duration:'annual',start:'2027-02-01',year:'2026'}]};
 assert.ok(validatePurchaseDraft(annual,today)['start-CH']);
 assert.match(trailerGuidance('CH','car'),/separată/);
 assert.match(trailerGuidance('AT','car'),/nu are/);
 assert.match(trailerGuidance('HU','van'),/produsul U/);
 assert.match(trailerGuidance('SK','car'),/masele/);
});
test('domestic Moldova and stale light products on heavy profiles cannot pass validation',()=>{
 assert.ok(validatePurchaseDraft({...base,vehicle:'heavy'},today)['duration-AT']);
 assert.ok(validatePurchaseDraft({...base,registration:'MD',vin:'WVWZZZ1JZXW000001',selections:[{...base.selections[0],country:'MD',duration:'d7'}]},today)['duration-MD']);
});
