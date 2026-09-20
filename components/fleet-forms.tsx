'use client';
import {useActionState,useState} from 'react';
import {saveCompany,saveFleetAsset,saveFleetBatch} from '../app/(account)/cont/firma/actions';
import {assetKinds,fleetCountries,isTowed,type FleetAsset} from '../packages/domain/fleet';
import type {ActionState} from '../packages/domain/account';
const initial:ActionState={};
function Status({state}:{state:ActionState}){return <>{state.error&&<p role="alert" className="account-error">{state.error}</p>}{state.success&&<p role="status" className="account-success">{state.success}</p>}</>;}
export function CompanyForm({company}:{company?:{id:string;name:string;tax_id:string;country:string;billing_address:string;billing_email:string}}){
 const [state,action,pending]=useActionState(saveCompany,initial);
 return <form action={action}><Status state={state}/>{company&&<input type="hidden" name="company_id" value={company.id}/>}
 <label>Denumirea firmei<input name="name" required maxLength={160} defaultValue={company?.name}/></label>
 <div className="date-pair"><label>Cod fiscal / CUI<input name="tax_id" required maxLength={40} defaultValue={company?.tax_id}/></label>
 <label>Țara firmei (cod ISO)<input name="country" pattern="[A-Z]{2}" maxLength={2} required defaultValue={company?.country??'RO'}/></label></div>
 <label>Adresa de facturare<textarea name="billing_address" required minLength={5} maxLength={500} defaultValue={company?.billing_address}/></label>
 <label>E-mail contabilitate<input name="billing_email" type="email" required defaultValue={company?.billing_email}/></label>
 <button className="primary" disabled={pending}>{pending?'Se salvează…':'Salvează firma'}</button></form>;
}
export function FleetAssetForm({companyId}:{companyId:string}){
 const [state,action,pending]=useActionState(saveFleetAsset,initial);
 return <form action={action}><Status state={state}/><input type="hidden" name="company_id" value={companyId}/>
 <label>Tip vehicul<select name="kind">{Object.entries(assetKinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
 <div className="date-pair"><label>Număr înmatriculare<input name="plate" required maxLength={20}/></label><label>Țara înmatriculării<input name="registration_country" pattern="[A-Z]{2}" maxLength={2} required defaultValue="RO"/></label></div>
 <label>Denumire internă<input name="label" maxLength={80} placeholder="Ex. Camion 12 / Depozit Timișoara"/></label>
 <details><summary>Date tehnice din talon</summary><p>Completează valorile cunoscute. Datele lipsă vor fi cerute înainte de cumpărare.</p>
 <div className="date-pair">{[['f1','F.1 — masa maximă tehnică (kg)'],['f2','F.2 — masa autorizată (kg)'],['f3','F.3 — masa ansamblului (kg)'],['axles','Număr de axe']].map(([name,label])=><label key={name}>{label}<input name={name} type="number" min="1" max={name==='axles'?12:200000}/></label>)}</div>
 <div className="date-pair"><label>Normă EURO<select name="euro"><option value="unknown">Nu cunosc încă</option>{['0','1','2','3','4','5','6','electric'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Clasă CO₂<select name="co2_class"><option value="">Nu cunosc încă</option>{[1,2,3,4,5].map(x=><option key={x}>{x}</option>)}</select></label></div></details>
 <button className="primary" disabled={pending}>{pending?'Se salvează…':'Adaugă în flotă'}</button></form>;
}
export function FleetBatchForm({companyId,assets}:{companyId:string;assets:FleetAsset[]}){
 const [state,action,pending]=useActionState(saveFleetBatch,initial);
 const [selected,setSelected]=useState<string[]>([]);
 const [trailers,setTrailers]=useState<Record<string,string>>({});
 const [countries,setCountries]=useState<string[]>([]);
 const [title,setTitle]=useState('Comandă flotă'),[start,setStart]=useState(''),[end,setEnd]=useState('');
 const motors=assets.filter(x=>!isTowed(x.kind)),towed=assets.filter(x=>isTowed(x.kind));
 const toggle=(values:string[],id:string)=>values.includes(id)?values.filter(x=>x!==id):[...values,id];
 return <form action={action}><Status state={state}/><input type="hidden" name="batch" value={JSON.stringify({company_id:companyId,title,start,end,countries,vehicles:selected.map(vehicle_id=>({vehicle_id,trailer_id:trailers[vehicle_id]||null}))})}/>
 <label>Nume comandă<input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={100}/></label>
 <fieldset className="workspace-fieldset"><legend>1. Alege vehiculele</legend>{!motors.length&&<p>Adaugă primul vehicul motor în flotă.</p>}
 {motors.length>0&&<button type="button" className="secondary" onClick={()=>setSelected(selected.length===motors.length?[]:motors.map(x=>x.id))}>{selected.length===motors.length?'Deselectează toate':'Selectează toate'}</button>}
 {motors.map(v=><div key={v.id} className="workspace-item"><label className="workspace-check"><input type="checkbox" checked={selected.includes(v.id)} onChange={()=>setSelected(toggle(selected,v.id))}/>{v.registration_country} · {v.plate} — {v.label||assetKinds[v.kind]}</label>
 {selected.includes(v.id)&&<label>Remorcă / semiremorcă pentru {v.plate}<select value={trailers[v.id]??''} onChange={e=>setTrailers({...trailers,[v.id]:e.target.value})}><option value="">Fără remorcă</option>{towed.filter(t=>v.kind==='tractor'?t.kind==='semitrailer':t.kind==='trailer').map(t=><option key={t.id} value={t.id}>{t.plate} — {assetKinds[t.kind]}</option>)}</select></label>}</div>)}</fieldset>
 <fieldset className="workspace-fieldset"><legend>2. Țări și perioadă comună</legend><div className="workspace-choices">{fleetCountries.map(c=><label key={c}><input type="checkbox" checked={countries.includes(c)} onChange={()=>setCountries(toggle(countries,c))}/>{c}</label>)}</div>
 <div className="date-pair"><label>De la<input type="date" value={start} onChange={e=>setStart(e.target.value)} required/></label><label>Până la<input type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)} required/></label></div></fieldset>
 <p><strong>{selected.length} vehicule · {countries.length} țări · o comandă comună</strong></p>
 <p>Factura comună va fi disponibilă pentru pozițiile cu același emitent și același cumpărător, conform condițiilor fiscale. Plata va fi imediată.</p>
 <button className="primary" disabled={pending||!selected.length||!countries.length}>{pending?'Se salvează…':'Salvează comanda comună'}</button>
 <p className="account-note">În această etapă se salvează o ciornă. Nu se încasează bani și nu se emit viniete.</p></form>;
}
