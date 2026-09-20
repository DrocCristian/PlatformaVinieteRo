import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePlanner} from '../../packages/domain/planner-validation.ts';
import {emptyTechnical} from '../../packages/domain/vehicle-profile.ts';
import {tollSummary,tollSystemLabels} from '../../packages/domain/toll-presentation.ts';
import {assessTolls} from '../../packages/domain/toll-rules.ts';
import {locales,translator} from '../../packages/i18n/public.ts';
const route={origin:'Cluj',destination:'Viena',departure:'2099-10-10',returnDate:'2099-10-15'};
const blank={origin:'',destination:'',departure:'',returnDate:''};
const period={entry:'2099-10-10',exit:'2099-10-15'};
test('national periods must fit the optional journey, including boundary days',()=>{
 assert.deepEqual(validatePlanner('B123ABC',emptyTechnical(),route,['AT'],{AT:period}),{});
 assert.equal(validatePlanner('B123ABC',emptyTechnical(),route,['AT'],{AT:{entry:'2099-10-09',exit:'2099-10-16'}})['entry-AT'],'Perioada în țară trebuie să fie inclusă în perioada cursei.');
 assert.ok(validatePlanner('B123ABC',emptyTechnical(),route,['AT'],{AT:{entry:'2099-10-09',exit:'2099-10-16'}})['exit-AT']);
 assert.deepEqual(validatePlanner('B123ABC',emptyTechnical(),blank,['AT'],{AT:{entry:'2099-10-20',exit:'2099-10-22'}}),{});
 assert.deepEqual(validatePlanner('B123ABC',emptyTechnical(),route,['AT'],{AT:{entry:'2099-10-12',exit:'2099-10-12'}}),{});
});
test('technical errors target the vehicle or trailer field, never a valid plate',()=>{
 const vehicle={...emptyTechnical(),f1:3000,f2:3500,axles:1};
 const errors=validatePlanner('B123ABC',vehicle,blank,['AT'],{AT:period});
 assert.equal(errors['technical.f2'],'Masa F.2 nu poate depăși masa F.1.');
 assert.ok(errors['technical.axles']);assert.equal(errors.plate,undefined);
 const trailer={plate:'B123REM',country:'RO',category:'O2' as const,f1:1500,f2:1800,axles:2};
 assert.equal(validatePlanner('B123ABC',{...emptyTechnical(),trailer},blank,['AT'],{AT:period})['technical.trailer.f2'],'Verifică masele remorcii: F.2 nu poate depăși F.1.');
});
test('partial routes and reversed dates identify the correct controls',()=>{
 assert.ok(validatePlanner('B123ABC',emptyTechnical(),{...blank,origin:'Cluj'},['AT'],{AT:period})['route.destination']);
 const errors=validatePlanner('B123ABC',emptyTechnical(),{...route,returnDate:'2099-10-09'},['AT'],{AT:period});
 assert.equal(errors['route.returnDate'],'Ultima zi trebuie să fie după plecare.');assert.equal(errors.plate,undefined);
 assert.ok(validatePlanner('B123ABC',emptyTechnical(),{...route,destination:'cluj'},['AT'],{AT:period})['route.destination']);
});
test('presentation translates internal codes and keeps official toll names',()=>{
 const vehicle={...emptyTechnical(),f1:3500,category:'M1' as const};
 const sk=assessTolls('SK',vehicle,'RO','2026-10-10');
 assert.equal(tollSummary(sk,translator()),'Vinietă · Vehicul');
 const unknown={...sk,system:'internal-new-system',vehicleClass:'INTERNAL'};
 assert.equal(tollSummary(unknown,translator()),'De verificat');
 assert.equal(tollSummary({...sk,system:'GO-Maut',vehicleClass:null},translator()),'GO-Maut');
});
test('every exposed rule reason, custom validation and presentation label has translations',()=>{
 const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
 const rules=read('../../packages/domain/toll-rules.ts');
 const reasons=[...rules.matchAll(/(?:stop|reasons\.push)\('([^']+)'\)/g)].map(m=>m[1]);
 const vehicle=read('../../packages/domain/vehicle-profile.ts');
 const technical=[...vehicle.matchAll(/issue\('([^']+)'\)/g)].map(m=>m[1]);
 const keys=[...reasons,...technical,'Vehicul','Perioada în țară trebuie să fie inclusă în perioada cursei.','Verifică data plecării.','Verifică ultima zi a călătoriei.','Plecarea și destinația trebuie să fie diferite.','Ultima zi trebuie să fie după plecare.','Data plecării nu poate fi în trecut.',...Object.entries(tollSystemLabels).filter(([code])=>['review','vignette','rovinieta','route-review','distance-toll'].includes(code)).map(([,label])=>label)];
 for(const locale of locales.filter(l=>l!=='ro')){
  const messages=JSON.parse(read('../../packages/i18n/'+locale+'.json'));
  for(const key of keys)assert.ok(messages[key]?.trim(),locale+': '+key);
 }
});

test('injected today is shared by the journey and country periods',()=>{
 const errors=validatePlanner('B123ABC',emptyTechnical(),route,['AT'],{AT:period},'2099-10-11');
 assert.equal(errors['route.departure'],'Data plecării nu poate fi în trecut.');
 assert.equal(errors['entry-AT'],'Data intrării nu poate fi în trecut.');
});
