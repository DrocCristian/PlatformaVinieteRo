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
 await expect(page.locator('#plate-error')).toHaveText('Verifică datele din talon și ale remorcii.');
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
