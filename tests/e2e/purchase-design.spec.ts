import {test,expect} from '@playwright/test';

test('country cards keep conditional questions next to their own duration',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');await page.locator('.purchase-actions button[type=submit]').click();
 for(const name of ['Ungaria','Cehia','Slovenia'])await page.getByRole('button',{name,exact:true}).click();
 await expect(page.locator('.purchase-country-card').filter({has:page.locator('#duration-HU')}).locator('#car-seats')).toBeVisible();
 await expect(page.locator('.purchase-country-card').filter({has:page.locator('#duration-CZ')}).locator('#car-fuel')).toBeVisible();
 await expect(page.locator('.purchase-country-card').filter({has:page.locator('#duration-SI')}).locator('#car-slovenia')).toBeVisible();
 await page.locator('#car-fuel').selectOption('plugin');await expect(page.locator('#car-co2')).toBeVisible();
 await page.locator('#car-fuel').selectOption('electric');await expect(page.locator('#car-co2')).toHaveCount(0);
 await page.getByRole('button',{name:'Elimină Ungaria',exact:true}).click();await expect(page.locator('#car-seats')).toHaveCount(0);
});

test('Bulgaria asks for time only for 24 hours and annual products ask for year',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Bulgaria',exact:true}).click();await page.locator('#duration-BG').selectOption('d1');
 await expect(page.locator('#time-BG')).toBeVisible();await page.locator('#time-BG').fill('12:30');
 await page.locator('#duration-BG').selectOption('d7');await expect(page.locator('#time-BG')).toHaveCount(0);
 await page.getByRole('button',{name:'Austria',exact:true}).click();await page.locator('#duration-AT').selectOption('annual');
 await expect(page.locator('#year-AT')).toBeVisible();await page.locator('#duration-AT').selectOption('d10');await expect(page.locator('#year-AT')).toHaveCount(0);
});

test('implicit submission on review cannot advance past the disabled payment step',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Austria',exact:true}).click();await page.locator('#duration-AT').selectOption('d10');await page.locator('#start-AT').fill('2099-10-01');
 await page.locator('#car-standard').check();await page.locator('.purchase-actions button[type=submit]').click();
 await page.locator('.purchase-form').evaluate((form:HTMLFormElement)=>form.requestSubmit());
 await expect(page.locator('.purchase-steps [aria-current=step]')).toContainText('Verificare');
 await expect(page.locator('.purchase-actions .purchase-primary')).toBeDisabled();
});

test('mobile summary expands on demand and preserves entered data',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.locator('#plate').fill('B123ABC');
 const toggle=page.locator('.purchase-summary-toggle');await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.purchase-summary-content')).toBeHidden();await toggle.click();
 await expect(page.locator('.purchase-summary-content')).toContainText('B123ABC');await toggle.click();
 await page.setViewportSize({width:1440,height:900});await expect(page.locator('.purchase-summary-content')).toBeVisible();
 await expect(page.locator('#plate')).toHaveValue('B123ABC');
});
