import {test,expect} from '@playwright/test';

test('car questions follow selected countries and uncertain answers block review',async({page})=>{
 await page.goto('/cumpara/demo');
 await expect(page.locator('#vin')).not.toBeVisible();
 await page.locator('#plate').fill('B123ABC');
 await page.locator('.purchase-actions button[type=submit]').click();
 for(const country of ['Ungaria','Slovenia','Cehia'])await page.getByRole('button',{name:country,exact:true}).click();
 for(const [country,duration] of [['HU','d10'],['SI','d7'],['CZ','d10']]){
  await page.locator('#duration-'+country).selectOption(duration);await page.locator('#start-'+country).fill('2099-10-01');
 }
 await expect(page.locator('#technical-f1')).toHaveCount(0);
 await expect(page.locator('#technical-frontHeightMm')).toHaveCount(0);
 await page.locator('#car-standard').check();await page.locator('#car-seats').selectOption('unknown');
 await page.locator('#car-slovenia').selectOption('2B');await page.locator('#car-fuel').selectOption('plugin');
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('#car-seats')).toBeFocused();await expect(page.locator('#car-co2-error')).toBeVisible();
 await page.locator('#car-seats').selectOption('8-or-9');await page.locator('#car-co2').selectOption('up-to-50');
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.passenger-review')).toContainText('Ungaria: D2');await expect(page.locator('.passenger-review')).toContainText('2B');
 await expect(page.locator('.purchase-actions .purchase-primary')).toBeDisabled();
 await page.getByRole('button',{name:'← Înapoi',exact:true}).click();
 await page.getByRole('button',{name:'Elimină Ungaria',exact:true}).click();
 await expect(page.locator('#car-seats')).toHaveCount(0);
 await page.locator('#car-fuel').selectOption('electric');await expect(page.locator('#car-co2')).toHaveCount(0);
 await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('.passenger-review')).toContainText('nu este acordată automat');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Romanian VIN is requested after countries without mandatory mass and seat inputs',async({page})=>{
 await page.goto('/');await page.locator('#plate').fill('B123ABC');await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'România',exact:true}).click();
 await page.locator('#duration-RO').selectOption('d30');await page.locator('#start-RO').fill('2099-10-01');
 await page.locator('#car-standard').check();await page.locator('.purchase-actions button[type=submit]').click();
 await expect(page.locator('#vin')).toBeFocused();await page.locator('#vin').fill('WVWZZZ1JZXW000001');
 await expect(page.locator('#car-seats')).toHaveCount(0);
 await page.locator('.purchase-actions button[type=submit]').click();await expect(page.locator('.purchase-review')).toContainText('România');
});


test('vehicle changes clear declarations and an invalid optional VIN opens its details',async({page})=>{
 await page.goto('/cumpara/demo');await page.locator('#plate').fill('B123ABC');
 await page.locator('.passenger-optional summary').click();await page.locator('#vin').fill('BADVIN');await page.locator('.passenger-optional summary').click();
 await page.locator('.purchase-actions button[type=submit]').click();await expect(page.locator('#vin')).toBeVisible();await expect(page.locator('#vin')).toBeFocused();
 await page.locator('#vin').fill('');await page.locator('.purchase-actions button[type=submit]').click();
 await page.getByRole('button',{name:'Austria',exact:true}).click();await page.locator('#car-standard').check();
 await page.getByRole('button',{name:'← Înapoi',exact:true}).click();await page.locator('#plate').fill('B456XYZ');
 await page.locator('.purchase-actions button[type=submit]').click();await expect(page.locator('#car-standard')).not.toBeChecked();
});
