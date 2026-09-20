import {test,expect} from '@playwright/test';
test('diagnostic references are unique, match response bodies and never permit caching',async({request})=>{
 const references=new Set<string>();
 for(const path of ['/api/stripe/webhook','/api/internal/issuance']){
  for(let i=0;i<2;i++){
   const response=await request.post(path,{data:'{}',headers:{'X-Request-ID':'untrusted-client-value'}});
   expect(response.status()).toBe(503);
   const id=response.headers()['x-request-id'];
   expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f-]{27}$/);
   expect((await response.json()).requestId).toBe(id);
   expect(response.headers()['cache-control']).toBe('no-store');
   references.add(id);
  }
 }
 expect(references.size).toBe(4);
});
test('callback diagnostic preserves safe redirects and a private response',async({request})=>{
 const response=await request.get('/auth/callback?next=https://example.invalid',{maxRedirects:0});
 expect(response.status()).toBe(307);
 expect(response.headers()['location']).toMatch(/\/autentificare\?error=callback$/);
 expect(response.headers()['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f-]{27}$/);
 expect(response.headers()['cache-control']).toContain('no-store');
 expect(response.headers()['referrer-policy']).toBe('no-referrer');
});
