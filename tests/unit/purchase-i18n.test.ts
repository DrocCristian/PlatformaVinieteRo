import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
import {locales} from '../../packages/i18n/public.ts';import {durationLabel} from '../../packages/i18n/purchase-labels.ts';
test('purchase form static UI strings have translations in every site language',()=>{
 const file=new URL('../../components/purchase-demo.tsx',import.meta.url),source=fs.readFileSync(file,'utf8');
 const sf=ts.createSourceFile('purchase.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const keys=new Set<string>();
 function visit(n:ts.Node){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='t'&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0]))keys.add(n.arguments[0].text);ts.forEachChild(n,visit);}visit(sf);
 for(const locale of locales.filter(l=>l!=='ro')){const base=JSON.parse(fs.readFileSync(new URL('../../packages/i18n/'+locale+'.json',import.meta.url),'utf8'));const added=JSON.parse(fs.readFileSync(new URL('../../packages/i18n/purchase/'+locale+'.json',import.meta.url),'utf8'));for(const key of keys)assert.ok((added[key]??base[key])?.trim(),locale+': '+key);}
});
test('duration labels retain 24 hours versus calendar day distinction',()=>{
 assert.match(durationLabel('d1','24 de ore','de'),/24/);assert.match(durationLabel('d1','1 zi','de'),/1/);
 assert.equal(durationLabel('annual','Anuală','de'),'Jahresvignette');
});
