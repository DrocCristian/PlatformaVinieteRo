import {test,expect} from '@playwright/test';
test('catalog lists all nine countries without offering unverified products',async({page})=>{
 await page.goto('/catalog');
 await expect(page.getByRole('heading',{name:'Catalogul vinietelor',exact:true})).toBeVisible();
 await expect(page.locator('.catalog-country')).toHaveCount(9);
 await expect(page.locator('.catalog-status').filter({hasText:'În pregătire'})).toHaveCount(9);
 await expect(page.getByRole('button',{name:/cumpără|plătește/i})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('link',{name:'← Planifică o călătorie'}).click();
 await expect(page.getByRole('heading',{name:'Viniete digitale pentru Europa'})).toBeVisible();
});