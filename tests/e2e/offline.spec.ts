import {test,expect} from '@playwright/test';
test('offline fallback stores only a public explanation',async({page,context})=>{
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.reload();
 await context.setOffline(true);
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Ești momentan offline'})).toBeVisible();
 const cached=await page.evaluate(async()=>{const c=await caches.open('vignexo-public-v1');return (await c.keys()).map(r=>new URL(r.url).pathname);});
 expect(cached).toEqual(['/offline.html']);
 await context.setOffline(false);
});
