// Internal quote contract. This module never issues a vignette or authorizes payment.
// Production adapters must supply authoritative products; test adapters stay in tests.
export type QuotedProduct={
 id:string; country:string; version:string; amountMinor:number; currency:string;
 environment:'test'|'live'; verified:boolean; supplierAuthorized:boolean;
 validUntil:string;
};
export type QuoteResult=
 |{ok:true;currency:string;totalMinor:number;items:QuotedProduct[]}
 |{ok:false;reason:'empty'|'duplicate'|'unavailable'|'expired'|'currency'|'amount'|'environment'};
export function calculateQuote(products:readonly QuotedProduct[],environment:'test'|'live',now:Date):QuoteResult{
 if(!products.length)return {ok:false,reason:'empty'};
 if(new Set(products.map(p=>p.id)).size!==products.length)return {ok:false,reason:'duplicate'};
 let totalMinor=0;const currency=products[0].currency;
 for(const p of products){
  if(!p.id||!p.version||!p.verified||!p.supplierAuthorized)return {ok:false,reason:'unavailable'};
  if(p.environment!==environment)return {ok:false,reason:'environment'};
  const deadline=Date.parse(p.validUntil);
  if(!Number.isFinite(deadline)||deadline<=now.getTime())return {ok:false,reason:'expired'};
  if(!/^[A-Z]{3}$/.test(currency)||p.currency!==currency)return {ok:false,reason:'currency'};
  if(!Number.isSafeInteger(p.amountMinor)||p.amountMinor<=0)return {ok:false,reason:'amount'};
  totalMinor+=p.amountMinor;if(!Number.isSafeInteger(totalMinor))return {ok:false,reason:'amount'};
 }
 return {ok:true,currency,totalMinor,items:products.map(p=>({...p}))};
}
