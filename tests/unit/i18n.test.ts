import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {locales,localizedPath,translator} from '../../packages/i18n/public.ts';
test('every supported translation includes all public text without empty fallbacks',()=>{
 const reference=JSON.parse(readFileSync(new URL('../../packages/i18n/de.json',import.meta.url),'utf8'));
 for(const locale of locales.filter(value=>value!=='ro')){
  const messages=JSON.parse(readFileSync(new URL('../../packages/i18n/'+locale+'.json',import.meta.url),'utf8')) as Record<string,string>;
  assert.deepEqual(Object.keys(messages).sort(),Object.keys(reference).sort(),locale);
  for(const [key,value] of Object.entries(messages))assert.ok(value.trim().length>0,locale+': '+key);
 }
});
test('language links use valid language codes and preserve catalog paths',()=>{
 assert.equal(localizedPath('ro'),'/');
 assert.equal(localizedPath('cs','/catalog'),'/cs/catalog');
 assert.equal(localizedPath('el'),'/el');
 assert.equal(translator({'Austria':'Αυστρία'})(' Austria '),' Αυστρία ');
});
