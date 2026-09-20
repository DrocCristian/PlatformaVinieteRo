import {test,expect} from '@playwright/test';
test('technical mass error targets mass and trailers retain their data',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');
 await page.getByRole('checkbox',{name:'Am remorcă, rulotă sau semiremorcă'}).check();
 await page.locator('#trailer-plate').fill('B123REM');await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Slovacia',exact:true}).click();
 await page.locator('#duration-SK').selectOption('d10');await page.locator('#start-SK').fill('2099-10-01');
 for(const [id,value] of Object.entries({category:'M1',f1:'3000',f2:'3500','trailer-category':'O2','trailer-f1':'1500','trailer-f2':'1500'}))await page.locator('#technical-'+id).fill(value);
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('#technical-f2')).toBeFocused();await expect(page.locator('#technical-f2')).toHaveAccessibleDescription('Masa F.2 nu poate depăși masa F.1.');
 await expect(page.locator('#plate-error')).toHaveCount(0);await page.locator('#technical-f2').fill('3000');await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.purchase-review')).toContainText('remorcă');await page.getByRole('button',{name:'← Înapoi'}).click();
 await expect(page.locator('#technical-trailer-f1')).toHaveValue('1500');
});
test('heavy vehicles collect route and never offer a car product',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');await page.locator('input[value=heavy]').check();await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Austria',exact:true}).click();await expect(page.locator('#duration-AT')).toHaveCount(0);
 await page.locator('#start-AT').fill('2099-10-01');
 for(const [id,value] of Object.entries({category:'N3',f1:'18000',f2:'18000',axles:'3',euro:'6'}))await page.locator('#technical-'+id).fill(value);
 await page.locator('.purchase-actions button[type=submit]').click();await expect(page.locator('#route-from')).toBeFocused();
 await page.locator('#route-from').fill('Viena');await page.locator('#route-to').fill('Budapesta');await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.purchase-review')).toContainText('Taxă de verificat pe rută');await expect(page.locator('.purchase-actions .purchase-primary')).toBeDisabled();
});
test('mobile navigation and fields remain usable and documents are honest about preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.getByRole('link',{name:'Viniete',exact:true}).click();await expect(page.getByRole('heading',{name:'Catalogul vinietelor'})).toBeVisible();
 await page.goto('/');expect(await page.locator('#plate').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/conditii-cumparare');await expect(page.getByRole('heading',{name:'Condiții de cumpărare',exact:true})).toBeVisible();await expect(page.locator('main')).toContainText('Nu acceptăm plăți');
});
