import {test,expect} from '@playwright/test';
const cases=[
 {locale:'hu',heading:'E-matricák az utazásodhoz',next:'Tovább a járműhöz',check:'Adatok ellenőrzése',error:'Ehhez az előnézethez',country:'Ausztria'},
 {locale:'de',heading:'Vignetten für deine Reise',next:'Weiter zum Fahrzeug',check:'Daten prüfen',error:'Gib für diese Vorschau',country:'Österreich'},
 {locale:'it',heading:'Vignette per il tuo viaggio',next:'Continua con il veicolo',check:'Verifica i dati',error:'Inserisci da 2 a 12',country:'Austria'},
];
for(const c of cases)test(c.locale+' public pages and planner are translated',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/'+c.locale);
 await expect(page.getByRole('heading',{name:c.heading,exact:true})).toBeVisible();
 await expect(page.locator('div[lang="'+c.locale+'"]').first()).toBeVisible();
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://vignexo.com/'+c.locale);
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/noindex/);
 await expect(page.locator('link[hreflang="de-AT"]')).toHaveAttribute('href','https://vignexo.com/de');
 await expect(page.locator('link[hreflang="de-DE"]')).toHaveAttribute('href','https://vignexo.com/de');
 await expect(page.locator('.locale-links a')).toHaveCount(4);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:c.next,exact:true}).click();
 await page.locator('#plate').fill('!');
 await page.getByRole('button',{name:c.check,exact:true}).click();
 await expect(page.locator('#plate-error')).toContainText(c.error);
 await page.locator('#plate').fill('B 123 ABC');
 await page.getByRole('button',{name:c.check,exact:true}).click();
 await expect(page.locator('#period-error')).toContainText(c.country);
 const future=new Date();future.setFullYear(future.getFullYear()+1);const day=future.toISOString().slice(0,10);
 for(const code of ['AT','HU','RO']){await page.locator('#entry-'+code).fill(day);await page.locator('#exit-'+code).fill(day);}
 await page.getByRole('button',{name:c.check,exact:true}).click();
 await expect(page.locator('.trip-review>div')).toHaveCount(3);
 await expect(page.locator('.trip-review a').first()).toHaveAttribute('href','/'+c.locale+'/catalog#AT');
 await page.locator('.trip-review a').first().click();
 await expect(page.locator('.catalog-country')).toHaveCount(9);
 await expect(page.locator('.locale-links a[lang=it]')).toHaveAttribute('href','/it/catalog');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('sitemap contains only canonical public pages; indexing stays disabled',async({request})=>{
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.status()).toBe(200);
 const xml=await sitemap.text();
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
 expect(urls.sort()).toEqual(['','/catalog','/hu','/hu/catalog','/de','/de/catalog','/it','/it/catalog'].map(path=>'https://vignexo.com'+(path||'/')).sort());
 expect(xml).toContain('hreflang="de-AT"');expect(xml).toContain('hreflang="de-DE"');
 for(const url of urls){const response=await request.get(new URL(url).pathname);expect(response.status()).toBe(200);expect(await response.text()).toMatch(/name="robots" content="noindex/);}
 const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);expect(await robots.text()).not.toContain('Sitemap:');
 for(const path of ['/fr','/ro','/de/missing'])expect((await request.get(path)).status()).toBe(404);
});
