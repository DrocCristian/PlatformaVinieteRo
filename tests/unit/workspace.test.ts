import {test} from 'node:test';import assert from 'node:assert/strict';
import {destinationsSchema,journeySchema,supportSchema} from '../../packages/domain/workspace.ts';
test('saved travel rejects duplicate countries, backwards and impossible dates',()=>{
 const d={country:'AT',entry:'2099-07-01',exit:'2099-07-03'};
 assert.equal(destinationsSchema.safeParse([d]).success,true);
 for(const value of [[d,d],[{...d,exit:'2099-06-30'}],[{...d,entry:'2099-02-30'}],[]])assert.equal(destinationsSchema.safeParse(value).success,false);
 assert.equal(journeySchema.safeParse({title:'Trip',plate:'B123ABC',registration_country:'RO',destinations:[{...d,entry:'2000-01-01'}]}).success,false);
});
test('support validates contents and an optional calendar deadline',()=>{
 const s={subject:'Ajutor',message:'Am nevoie de ajutor.',kind:'general',deadline:''};
 assert.equal(supportSchema.parse(s).deadline,null);
 assert.equal(supportSchema.safeParse({...s,deadline:'2026-02-30'}).success,false);
 assert.equal(supportSchema.safeParse({...s,message:'x'}).success,false);
});
