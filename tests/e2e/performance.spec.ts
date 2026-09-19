import {test,expect} from '@playwright/test';
test('map is visible in server HTML without downloading a graphics engine',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 const page=await context.newPage();
 await page.goto('/');
 await expect(page.locator('.map-svg [data-country="RO"]')).toBeVisible();
 await expect(page.locator('[data-map-state=ready]')).toBeVisible();
 await context.close();
});
test('lightweight map keeps selection and zoom, uses a compressed background',async({page})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/');
 const ro=page.locator('.map-svg [data-country="RO"]');
 await expect(ro).toHaveAttribute('fill','#ef8937');
 await ro.click();await expect(page.getByRole('button',{name:'Elimină România',exact:true})).toHaveCount(0);
 await ro.click();await expect(page.getByRole('button',{name:'Elimină România',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Mărește harta',exact:true}).click();
 await expect(page.locator('.map-svg>g')).toHaveAttribute('transform',/scale\(1.5\)/);
 await page.getByRole('button',{name:'Resetează harta',exact:true}).click();
 await expect(page.locator('.map-svg>g')).toHaveAttribute('transform',/scale\(1\)/);
 expect(requests.some(url=>/alpine-road.*v2.webp/.test(url))).toBe(true);
 expect(requests.filter(url=>/maplibre|europe.geojson|alpine-road.png/.test(url))).toEqual([]);
});
