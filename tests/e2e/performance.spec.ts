import {test,expect} from '@playwright/test';

test('purchase entry renders on the server without the old showcase assets',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 const page=await context.newPage();
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Mai puține griji. Mai mult drum.'})).toBeVisible();
 await expect(page.getByLabel('Număr de înmatriculare',{exact:true})).toBeVisible();
 await expect(page.locator('.purchase-summary')).toBeVisible();
 expect(requests.filter(url=>/maplibre|europe.geojson|alpine-road/.test(url))).toEqual([]);
 await context.close();
});

test('desktop and mobile keep the form and summary inside the viewport',async({page})=>{
 await page.goto('/');
 for(const width of [360,390,768,1440]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const form=await page.locator('.purchase-form').boundingBox();
  const summary=await page.locator('.purchase-summary').boundingBox();
  expect(form).not.toBeNull();expect(summary).not.toBeNull();
  if(width>=1000)expect(summary!.x).toBeGreaterThan(form!.x+form!.width);
  else expect(summary!.y).toBeGreaterThan(form!.y+form!.height);
 }
 await expect(page.locator('.purchase-logo img')).toHaveJSProperty('naturalWidth',34);
});
