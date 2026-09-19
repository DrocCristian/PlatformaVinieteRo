import {test,expect} from '@playwright/test';
test('contul protejat și navigația autentificării',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('/cont');
 await expect(page).toHaveURL(/\/autentificare$/);
 await expect(page.getByRole('heading',{name:'Bine ai revenit'})).toBeVisible();
 expect(response?.headers()['cache-control']).toMatch(/no-store|no-cache/);
 await page.getByRole('link',{name:'Nu ai cont? Înregistrează-te'}).click();
 await expect(page.getByRole('heading',{name:'Creează contul tău'})).toBeVisible();
 await page.getByRole('link',{name:'Înapoi la autentificare'}).click();
 await page.getByRole('link',{name:'Ai uitat parola?'}).click();
 await expect(page.getByRole('heading',{name:'Recuperează accesul'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('callback invalid nu poate redirecționa extern',async({page})=>{
 await page.goto('/auth/callback?next=https://example.invalid');
 await expect(page).toHaveURL(/\/autentificare\?error=callback$/);
 await expect(page.locator(".account-error[role=alert]")).toContainText('Linkul nu a putut fi confirmat');
});