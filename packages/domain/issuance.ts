export const supportedCountries=['AT','HU','RO','BG','CZ','SK','SI','CH','MD'] as const;
export type Country=(typeof supportedCountries)[number];
export type Outcome='issued'|'rejected'|'unconfirmed';
export type Scenario='success'|'refusal'|'timeout';
export type IssueRequest={idempotencyKey:string;country:Country;plate:string;scenario:Scenario};
export type IssueResult={status:Outcome;reference?:string;document?:string};
export interface ProviderConnector{
 readonly environment:'test'; readonly country:Country;
 issue(request:IssueRequest):Promise<IssueResult>;
 getStatus(idempotencyKey:string):Promise<IssueResult>;
}
// Deterministic mock responses are stable across process restarts; no real provider is called.
export function mockProvider(country:Country):ProviderConnector{
 return {environment:'test',country,
 async issue(r){
 if(r.country!==country||!r.idempotencyKey||!r.plate)throw new Error('Invalid issue request');
 if(r.scenario==='refusal')return {status:'rejected'};
 if(r.scenario==='timeout')return {status:'unconfirmed'};
 const reference='TEST-'+country+'-'+r.idempotencyKey;
 return {status:'issued',reference,document:'SIMULARE — FĂRĂ VALOARE DE VINIETĂ\n'+country+' · '+r.plate+'\n'+reference};
 },
 async getStatus(){return {status:'unconfirmed'};}
 };
}
export function aggregateOrder(statuses:readonly string[]){
 if(!statuses.length)throw new Error('An order requires items');
 if(statuses.some(s=>s==='unconfirmed'))return 'manual_review';
 if(statuses.some(s=>s==='pending'||s==='processing'))return 'issuing';
 if(statuses.every(s=>s==='issued'))return 'issued';
 if(statuses.every(s=>s==='rejected'))return 'failed';
 return 'partial';
}
export function assertTestPayment(event:{livemode:boolean;type:string},session:{mode:string|null;payment_status:string;amount_total:number|null;currency:string|null}){
 if(event.livemode)throw new Error('Live payments are disabled');
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return false;
 return session.mode==='payment'&&session.payment_status==='paid'&&Number.isSafeInteger(session.amount_total)&&session.amount_total!>0&&!!session.currency;
}
