import {test,expect} from '@playwright/test';
test('vehicle mass bands and trailer details survive review and reject inconsistent weights',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Continuă cu vehiculul'}).click();
 await page.getByLabel('Număr de înmatriculare',{exact:true}).fill('B123ABC');
 await page.getByLabel('Masa F.1 (kg)',{exact:true}).fill('3500');
 await expect(page.locator('.weight-bands .active')).toHaveText('Până la 3,5 t inclusiv');
 await page.getByLabel('Masa F.1 (kg)',{exact:true}).fill('3501');
 await expect(page.locator('.weight-bands .active')).toHaveText('Peste 3,5 t');
 await page.getByLabel('Masa F.1 (kg)',{exact:true}).fill('3500');
 await page.getByLabel('Masa F.2 (kg)',{exact:true}).fill('3600');
 await page.getByRole('button',{name:'Verifică datele'}).click();
 await expect(page.getByLabel('Masa F.2 (kg)',{exact:true})).toBeFocused();
 await expect(page.getByLabel('Masa F.2 (kg)',{exact:true})).toHaveAttribute('aria-invalid','true');
 await expect(page.getByLabel('Masa F.2 (kg)',{exact:true})).toHaveAccessibleDescription('Masa F.2 nu poate depăși masa F.1.');
 await expect(page.locator('#plate-error')).toHaveCount(0);
 await page.getByLabel('Masa F.2 (kg)',{exact:true}).fill('3500');
 await page.getByLabel('Categoria J',{exact:true}).selectOption('M1');
 await page.getByLabel('Locuri S.1 (cu șofer)',{exact:true}).fill('5');
 await page.getByLabel('Cu remorcă / rulotă / semiremorcă',{exact:true}).check();
 await page.getByLabel('Numărul remorcii',{exact:true}).fill('B123REM');
 await page.getByLabel('Categoria remorcii',{exact:true}).selectOption('O2');
 await page.getByLabel('Remorcă F.1 (kg)',{exact:true}).fill('1500');
 await page.getByLabel('Remorcă F.2 (kg)',{exact:true}).fill('1500');
 await page.getByLabel('De unde pleci?',{exact:true}).fill('Cluj-Napoca, România');
 await page.getByLabel('Unde ajungi?',{exact:true}).fill('Viena, Austria');
 await page.getByLabel('Plecare',{exact:true}).fill('2099-01-01');
 await page.getByLabel('Ultima zi a călătoriei',{exact:true}).fill('2099-01-03');
 for(const c of ['Austria','Ungaria','România']){
 await page.getByLabel('Intrare în '+c,{exact:true}).fill('2099-01-01');
 await page.getByLabel('Ieșire din '+c,{exact:true}).fill('2099-01-03');
 }
 await page.getByRole('button',{name:'Verifică datele'}).click();
 await expect(page.getByText('Cluj-Napoca, România → Viena, Austria',{exact:true})).toBeVisible();
 await expect(page.locator('.summary-total strong')).toHaveText('—');
 await page.getByRole('button',{name:'Înapoi'}).click();
 await expect(page.getByLabel('Numărul remorcii',{exact:true})).toHaveValue('B123REM');
 await expect(page.getByLabel('Masa F.1 (kg)',{exact:true})).toHaveValue('3500');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


 test('invalid axles inside closed details opens the section and focuses the exact field',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Continuă cu vehiculul'}).click();
 await page.getByLabel('Număr de înmatriculare',{exact:true}).fill('B123ABC');
 const details=page.locator('.vehicle-details details');
 await details.locator('summary').click();
 const axles=page.getByLabel('Axe vehicul',{exact:true});
 await axles.fill('1');
 await details.locator('summary').click();
 await expect(details).not.toHaveAttribute('open','');
 await page.getByRole('button',{name:'Verifică datele'}).click();
 await expect(details).toHaveAttribute('open','');
 await expect(axles).toBeFocused();
 await expect(axles).toHaveAttribute('aria-invalid','true');
 await expect(axles).toHaveAccessibleDescription('Verifică datele din talon și ale remorcii.');
 await expect(page.locator('#plate')).toHaveAttribute('aria-invalid','false');
});

test('country dates outside the route stay on the form and focus the offending date',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Continuă cu vehiculul'}).click();
 await page.getByLabel('Număr de înmatriculare',{exact:true}).fill('B123ABC');
 await page.getByLabel('De unde pleci?',{exact:true}).fill('Cluj');
 await page.getByLabel('Unde ajungi?',{exact:true}).fill('Viena');
 await page.getByLabel('Plecare',{exact:true}).fill('2099-10-10');
 await page.getByLabel('Ultima zi a călătoriei',{exact:true}).fill('2099-10-15');
 for(const country of ['Austria','Ungaria','România']){
 await page.getByLabel('Intrare în '+country,{exact:true}).fill('2099-10-10');
 await page.getByLabel('Ieșire din '+country,{exact:true}).fill('2099-10-15');
 }
 const entry=page.getByLabel('Intrare în Austria',{exact:true});
 await entry.fill('2099-10-09');
 await page.getByRole('button',{name:'Verifică datele'}).click();
 await expect(entry).toBeFocused();
 await expect(entry).toHaveAccessibleDescription('Austria: Perioada în țară trebuie să fie inclusă în perioada cursei.');
 await entry.fill('2099-10-10');
 await page.getByRole('button',{name:'Verifică datele'}).click();
 await expect(page.getByRole('heading',{name:'Verifică planul călătoriei'})).toBeVisible();
 await expect(page.locator('.assessment-reasons').first()).toContainText('Regulile trebuie reverificate pentru perioada aleasă.');
});

test('mobile keeps catalog navigation, readable inputs and contrasting trailer labels',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('link',{name:'Viniete',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Catalogul vinietelor'})).toBeVisible();
 await page.goto('/');
 await page.getByRole('button',{name:'Continuă cu vehiculul'}).click();
 await page.getByLabel('Cu remorcă / rulotă / semiremorcă',{exact:true}).check();
 const input=page.getByLabel('Numărul remorcii',{exact:true});
 expect(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 const contrast=await page.locator('.trailer-fields').evaluate(el=>{
 const rgb=(s:string)=>s.match(/[\d.]+/g)!.slice(0,3).map(Number);
 const lum=(c:number[])=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const a=lum(rgb(getComputedStyle(el).backgroundColor));const b=lum(rgb(getComputedStyle(el.querySelector('label')!).color));
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });
 expect(contrast).toBeGreaterThanOrEqual(4.5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('German review exposes translated reasons rather than internal system codes',async({page})=>{
 await page.goto('/de');
 await page.getByRole('button',{name:'Weiter zum Fahrzeug'}).click();
 await page.locator('#plate').fill('B123ABC');
 for(const code of ['AT','HU','RO']){
 await page.locator('#entry-'+code).fill('2099-10-10');
 await page.locator('#exit-'+code).fill('2099-10-15');
 }
 await page.locator('button[form="vehicle-form"]').click();
 await expect(page.locator('.assessment-reasons').first()).toContainText('Die Regeln müssen für den gewählten Zeitraum erneut geprüft werden.');
 await expect(page.locator('.trip-review')).not.toContainText('Regulile trebuie');
});
