import {test,expect} from '@playwright/test';
const cases=[
 {locale:'hu',heading:'Digitális matricák Európában',next:'Tovább a járműhöz',check:'Adatok ellenőrzése',error:'Ehhez az előnézethez',country:'Ausztria'},
 {locale:'de',heading:'Digitale Vignetten für Europa',next:'Weiter zum Fahrzeug',check:'Daten prüfen',error:'Gib für diese Vorschau',country:'Österreich'},
 {locale:'it',heading:'Vignette digitali per l’Europa',next:'Continua con il veicolo',check:'Verifica i dati',error:'Inserisci da 2 a 12',country:'Austria'},
 {"locale":"ru","heading":"Электронные виньетки для Европы","next":"Перейти к автомобилю","check":"Проверить данные","error":"Для этого предпросмотра введите от 2 до 12 букв или цифр.","country":"Австрия"},
 {"locale":"pl","heading":"Winiety elektroniczne w Europie","next":"Przejdź do pojazdu","check":"Sprawdź dane","error":"W tym podglądzie wpisz od 2 do 12 liter lub cyfr.","country":"Austria"},
 {"locale":"bg","heading":"Електронни винетки за Европа","next":"Продължете с превозното средство","check":"Проверете данните","error":"За този преглед въведете между 2 и 12 букви или цифри.","country":"Австрия"},
 {"locale":"cs","heading":"Elektronické dálniční známky pro Evropu","next":"Pokračovat k vozidlu","check":"Zkontrolovat údaje","error":"Pro tento náhled zadejte 2 až 12 písmen nebo číslic.","country":"Rakousko"},
 {"locale":"sk","heading":"Elektronické diaľničné známky pre Európu","next":"Pokračovať k vozidlu","check":"Skontrolovať údaje","error":"Pre tento náhľad zadajte 2 až 12 písmen alebo číslic.","country":"Rakúsko"},
 {"locale":"el","heading":"Ψηφιακές βινιέτες για την Ευρώπη","next":"Συνέχεια με το όχημα","check":"Ελέγξτε τα στοιχεία","error":"Για αυτή την προεπισκόπηση εισαγάγετε 2 έως 12 γράμματα ή ψηφία.","country":"Αυστρία"},
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
 await expect(page.locator('.locale-links a')).toHaveCount(10);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#plate').fill('!');
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('#plate-error')).toBeVisible();
 await expect(page.locator('#plate-error')).not.toContainText('Introdu numărul');
 await page.locator('#plate').fill('B123ABC');
 await page.locator('.purchase-actions button[type=submit]').click();
 await page.locator('.purchase-countries button').first().click();
 await expect(page.locator('#duration-AT')).toBeVisible();
 await expect(page.locator('.purchase-country-card h3')).toContainText(c.country);
 await page.goto('/'+c.locale+'/catalog');
 await expect(page.locator('.catalog-country')).toHaveCount(9);
 await expect(page.locator('.locale-links a[lang=it]')).toHaveAttribute('href','/it/catalog');
 await page.locator('.locale-selector summary').click();
 await page.locator('.locale-links a[lang=ro]').click();
 await expect(page).toHaveURL(/\/catalog$/);
 await expect(page.getByRole('heading',{name:'Catalogul vinietelor',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('sitemap contains only canonical public pages; indexing stays disabled',async({request})=>{
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.status()).toBe(200);
 const xml=await sitemap.text();
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
 expect(urls.sort()).toEqual(['','/hu','/de','/it','/ru','/pl','/bg','/cs','/sk','/el'].flatMap(prefix=>['','/catalog'].map(path=>'https://vignexo.com'+((prefix+path)||'/'))).sort());
 expect(xml).toContain('hreflang="de-AT"');expect(xml).toContain('hreflang="de-DE"');
 for(const locale of ['ru','pl','bg','cs','sk','el'])expect(xml).toContain('hreflang="'+locale+'"');
 for(const url of urls){const response=await request.get(new URL(url).pathname);expect(response.status()).toBe(200);expect(await response.text()).toMatch(/name="robots" content="noindex/);}
 const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);expect(await robots.text()).not.toContain('Sitemap:');
 for(const path of ['/fr','/ro','/de/missing'])expect((await request.get(path)).status()).toBe(404);
});
