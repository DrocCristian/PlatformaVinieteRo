import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog,isCalendarDate,validateTravelPeriod} from '../../packages/domain/catalog.ts';
import {calculateQuote,type QuotedProduct} from '../../packages/domain/quote.ts';
test('all nine production catalogs are blocked and have no fabricated products',()=>{
 assert.equal(Object.keys(catalog).length,9);
 for(const c of Object.values(catalog)){assert.equal(c.status,'pending');assert.deepEqual(c.products,[]);}
});
test('calendar dates reject rollover, accept leap day and same-day travel',()=>{
 assert.equal(isCalendarDate('2027-02-29'),false);assert.equal(isCalendarDate('2028-02-29'),true);
 assert.equal(isCalendarDate('2028-04-31'),false);
 assert.equal(validateTravelPeriod({entry:'2028-02-29',exit:'2028-02-29'},'2028-01-01'),null);
 assert.ok(validateTravelPeriod({entry:'2028-01-01',exit:'2028-01-02'},'2028-01-03'));
 assert.ok(validateTravelPeriod({entry:'2028-02-02',exit:'2028-02-01'},'2028-01-01'));
});
const now=new Date('2028-01-01T00:00:00Z');
const fixture:QuotedProduct={id:'simulation-a',country:'AT',version:'test-v1',amountMinor:101,currency:'EUR',environment:'test',verified:true,supplierAuthorized:true,validUntil:'2028-01-02T00:00:00Z'};
test('test quote sums integer minor units without mutating products',()=>{
 const result=calculateQuote([fixture,{...fixture,id:'simulation-b',amountMinor:202}],'test',now);
 assert.equal(result.ok,true);if(result.ok){assert.equal(result.totalMinor,303);result.items[0].amountMinor=999;assert.equal(fixture.amountMinor,101);}
});
test('quote rejects test products in live, stale, duplicate, unauthorized and mixed currency offers',()=>{
 const cases:[QuotedProduct[],string][]=[
 [[fixture],'environment'],[[{...fixture,environment:'live',verified:false}],'unavailable'],
 [[{...fixture,environment:'live',supplierAuthorized:false}],'unavailable'],
 [[{...fixture,environment:'live',validUntil:now.toISOString()}],'expired'],
 [[{...fixture,environment:'live',amountMinor:1.2}],'amount'],
 [[{...fixture,environment:'live',amountMinor:0}],'amount'],
 [[{...fixture,environment:'live'},{...fixture,environment:'live'}],'duplicate'],
 [[{...fixture,environment:'live'},{...fixture,environment:'live',id:'b',currency:'RON'}],'currency']
 ];
 for(const [items,reason]of cases)assert.deepEqual(calculateQuote(items,'live',now),{ok:false,reason});
 assert.deepEqual(calculateQuote([],'live',now),{ok:false,reason:'empty'});
});
