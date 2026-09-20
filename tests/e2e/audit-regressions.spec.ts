import {test,expect} from '@playwright/test';

test('review remains on the last step after form submission',async({page})=>{
 await page.goto('/cumpara/demo');
 await page.locator('#plate').fill('B123ABC');
 await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Austria',exact:true}).click();
 await page.locator('#duration-AT').selectOption('d10');
 await page.locator('#start-AT').fill('2099-10-01');
 await page.locator('#car-standard').check();
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.purchase-review')).toBeVisible();
 await page.locator('form.purchase-card').evaluate((form:HTMLFormElement)=>form.requestSubmit());
 await expect(page.locator('.purchase-review')).toBeVisible();
 await expect(page.locator('.purchase-steps [aria-current=step]')).toContainText('Verificare');
});

test('changing vehicle type removes previous technical details from review',async({page})=>{
 await page.goto('/cumpara/demo');
 await page.locator('#plate').fill('B123ABC');
 await page.locator('input[name=vehicle][value=van]').check();
 await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Austria',exact:true}).click();
 await page.locator('#technical-category').fill('N1');
 await page.locator('#technical-f1').fill('3400');
 await page.locator('#technical-f2').fill('3200');
 await page.getByRole('button',{name:'← Înapoi',exact:true}).click();
 await page.locator('input[name=vehicle][value=car]').check();
 await page.locator('.purchase-actions button[type=submit]').click();
 await page.locator('#duration-AT').selectOption('d10');
 await page.locator('#start-AT').fill('2099-10-01');
 await page.locator('#car-standard').check();
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.passenger-review')).toContainText('M1/M1G');
 await expect(page.locator('.purchase-technical-review')).not.toContainText('N1');
 await expect(page.locator('.purchase-technical-review')).not.toContainText('3400');
});
