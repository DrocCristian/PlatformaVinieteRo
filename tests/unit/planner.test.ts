import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countries, toggleCountry, normalizePlate, isPreviewPlateValid } from '../../packages/domain/countries.ts';
test('nine unique supported destinations',()=>assert.equal(new Set(countries.map(c=>c.code)).size,9));
test('select, remove and re-add countries without duplicates or mutating input',()=>{
  const first=toggleCountry([], 'AT'); const next=toggleCountry(first, 'HU');
  assert.deepEqual(first,['AT']); assert.deepEqual(next,['AT','HU']);
  assert.deepEqual(toggleCountry(next,'AT'),['HU']);
  assert.deepEqual(toggleCountry(toggleCountry(next,'AT'),'AT'),['HU','AT']);
});
test('plate formatting tolerates spaces and separators',()=>assert.equal(normalizePlate(' b - 123 abc '),'B123ABC'));
test('preview rejects empty, oversized and punctuation-only plates',()=>{
  for(const input of ['', '  ', 'A', 'A'.repeat(13), '<script>', '!!!']) assert.equal(isPreviewPlateValid(input),false);
  assert.equal(isPreviewPlateValid('B 123 ABC'),true);
});
