import {test,expect} from '@playwright/test';
test('private workspace and documents require authentication',async({page,request})=>{
 for(const path of ['/cont/calatorii','/cont/comenzi','/cont/abonamente','/cont/notificari','/cont/suport','/cont/date','/cont/testare']){
 await page.goto(path);await expect(page).toHaveURL(/\/autentificare$/);
 }
 expect((await request.get('/cont/date/export')).status()).toBe(401);
 expect((await request.get('/cont/comenzi/document/00000000-0000-0000-0000-000000000000')).status()).toBe(401);
});
test('payment and worker endpoints fail closed before credentials exist',async({request})=>{
 expect((await request.post('/api/stripe/webhook',{data:'{}'})).status()).toBe(503);
 expect((await request.post('/api/internal/issuance',{data:'{}'})).status()).toBe(503);
});
