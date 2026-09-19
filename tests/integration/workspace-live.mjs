import {chromium} from '@playwright/test';
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
const fixture=JSON.parse(fs.readFileSync('work/auth-fixture.json','utf8'));
const base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
function totp(secret){let bits='';for(const c of secret.toUpperCase().replace(/=+$/,''))bits+='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c).toString(2).padStart(5,'0');const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const hash=createHmac('sha1',Buffer.from(bytes)).update(counter).digest();const offset=hash[19]&15;return String((hash.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');}
try{
 await page.goto(base+'/autentificare');
 await page.getByLabel('E-mail',{exact:true}).fill(fixture.email);await page.getByLabel('Parolă',{exact:true}).fill(fixture.password);
 await page.getByRole('button',{name:'Intră în cont',exact:true}).click();await page.waitForURL('**/cont',{timeout:30000});
 await page.goto(base+'/cont/calatorii');
 await page.getByLabel('Numele călătoriei').fill('Călătorie verificare');
 await page.getByLabel('Număr de înmatriculare',{exact:true}).fill('B 123 TST');
 await page.getByLabel('Intrare în România',{exact:true}).fill('2099-07-01');
 await page.getByLabel('Ieșire din România',{exact:true}).fill('2099-07-04');
 await page.getByRole('button',{name:'Salvează călătoria',exact:true}).click();
 await page.getByRole('status').waitFor();await page.reload();await page.getByRole('heading',{name:'Călătorie verificare',exact:true}).waitFor();
 await page.goto(base+'/cont/suport');await page.getByLabel('Subiect',{exact:true}).fill('Verificare suport');
 await page.getByLabel('Mesaj',{exact:true}).fill('Solicitare tehnică temporară pentru testarea contului.');
 await page.getByRole('button',{name:'Înregistrează solicitarea',exact:true}).click();await page.getByRole('status').waitFor();
 await page.reload();await page.getByRole('heading',{name:'Verificare suport',exact:true}).waitFor();
 await page.goto(base+'/cont/notificari');await page.getByRole('checkbox').check();
 await page.getByLabel('Limba preferată pentru notificări').selectOption('de');await page.getByRole('button',{name:'Salvează preferințele',exact:true}).click();await page.getByRole('status').waitFor();await page.reload();
 assert.equal(await page.getByRole('checkbox').isChecked(),true);
 assert.equal(await page.getByLabel('Limba preferată pentru notificări').inputValue(),'de');
 const exported=await page.request.get(base+'/cont/date/export');assert.equal(exported.status(),200);
 const data=await exported.json();assert.equal(data.account.id,fixture.id);assert.equal(data.journeys.length,1);assert.equal(data.support_cases.length,1);assert.equal(data.notification_preferences[0].language,'de');
 await page.goto(base+'/cont/administrare');await page.waitForURL('**/cont');
 await page.goto(base+'/cont/securitate');await page.getByRole('button',{name:'Configurează autentificatorul'}).click();
 const secret=await page.locator('code').textContent({timeout:20000});
 await page.getByLabel('Cod de securitate').fill(totp(secret.trim()));await page.getByRole('button',{name:'Verifică sesiunea'}).click();await page.getByRole('status').waitFor();
 await page.reload();await page.getByText('Sesiune verificată în doi pași.',{exact:true}).waitFor();
 await page.goto(base+'/cont/administrare');await page.waitForURL('**/cont');
 for(const path of ['/cont/comenzi','/cont/abonamente','/cont/date']){await page.goto(base+path);assert.equal(await page.locator('main [role=alert]').count(),0,path+': '+await page.locator('main [role=alert]').allTextContents());}
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/cont/calatorii');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'work/workspace-mobile.png',fullPage:true});
 await page.goto(base+'/cont');await page.getByRole('button',{name:'Deconectare'}).click();await page.waitForURL('**/autentificare');
 console.log('PASS authenticated trip/support/preferences persistence, personal export, admin denial before/after actual TOTP verification, mobile layout, logout');
}finally{await browser.close();}
