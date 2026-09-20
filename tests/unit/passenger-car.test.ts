import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCarAnswers,carCategoryHints} from '../../packages/domain/passenger-car.ts';

test('ordinary passenger car needs no invented mass or seats for AT RO BG SK CH MD',()=>{
 const answers={standard:'yes'};
 assert.deepEqual(validateCarAnswers(answers,['AT','RO','BG','SK','CH','MD']),{});
 assert.deepEqual(answers,{standard:'yes'});
 assert.ok(validateCarAnswers({},['AT'])['car-standard']);
});
test('multi-country car declarations distinguish Hungarian 7 and 8 seats without assuming D1',()=>{
 const answers={standard:'yes',seats:'8-or-9',slovenia:'2B',fuel:'standard'};
 assert.deepEqual(validateCarAnswers(answers,['HU','SI','CZ']),{});
 assert.ok(carCategoryHints(answers,['HU','SI']).some(x=>x.includes('D2')));
 assert.ok(carCategoryHints({...answers,seats:'up-to-7'},['HU']).some(x=>x.includes('D1')));
 assert.ok(validateCarAnswers({...answers,seats:'unknown'},['HU'])['car-seats']);
 assert.ok(validateCarAnswers({...answers,slovenia:'unknown'},['SI'])['car-slovenia']);
});
test('Czech plug-in requires emissions; electric declaration never claims automatic exemption',()=>{
 assert.ok(validateCarAnswers({standard:'yes',fuel:'plugin'},['CZ'])['car-co2']);
 assert.deepEqual(validateCarAnswers({standard:'yes',fuel:'plugin',co2:'up-to-50'},['CZ']),{});
 assert.ok(validateCarAnswers({standard:'yes',fuel:'diesel arbitrary'},['CZ'])['car-fuel']);
 assert.ok(carCategoryHints({standard:'yes',fuel:'electric'},['CZ']).some(x=>x.includes('nu este acordată automat')));
});
test('removing country removes only its questions; adding it requires its answers again',()=>{
 const answers={standard:'yes'};
 assert.deepEqual(validateCarAnswers(answers,['AT']),{});
 assert.deepEqual(Object.keys(validateCarAnswers(answers,['AT','HU','SI','CZ'])),['car-seats','car-slovenia','car-fuel']);
 assert.deepEqual(validateCarAnswers(answers,['AT']),{});
});
