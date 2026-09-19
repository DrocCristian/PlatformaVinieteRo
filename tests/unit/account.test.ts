import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vehicleSchema,credentialsSchema,safeReturnPath} from '../../packages/domain/account.ts';
test('saved plate normalization and country validation',()=>{
 assert.equal(vehicleSchema.parse({plate:' b-123 abc ',registration_country:'RO',label:''}).plate,'B123ABC');
 for(const plate of ['', 'a', 'B/123', '<script>', 'A'.repeat(13)]) assert.equal(vehicleSchema.safeParse({plate,registration_country:'RO',label:''}).success,false);
 assert.equal(vehicleSchema.safeParse({plate:'B123ABC',registration_country:'OTHER',label:''}).success,false);
});
test('credentials bounds',()=>{
 assert.equal(credentialsSchema.safeParse({email:'invalid',password:'12345678'}).success,false);
 assert.equal(credentialsSchema.safeParse({email:'demo@example.invalid',password:'short'}).success,false);
});
test('callback blocks external and unapproved redirects',()=>{
 for(const path of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','/admin',null])assert.equal(safeReturnPath(path),'/cont');
 assert.equal(safeReturnPath('/cont/parola'),'/cont/parola');
});