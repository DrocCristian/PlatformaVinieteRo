'use client';
import {useId} from 'react';
import {type TechnicalProfile,weightBand,kindLabels} from '../packages/domain/vehicle-profile';
import type {FieldErrors} from '../packages/domain/planner-validation';
import {translator,type Messages} from '../packages/i18n/public';
import FormField from './form-field';
export default function VehicleDetails({value,onChange,messages={},errors={}}:{value:TechnicalProfile;onChange:(value:TechnicalProfile)=>void;messages?:Messages;errors?:FieldErrors}){
 const t=translator(messages);
 const prefix=useId();
 const field=(name:string,label:string)=>({id:prefix+'-'+name,label:t(label),error:errors['technical.'+name]?t(errors['technical.'+name]):undefined});
 const attrs=(name:string)=>({id:prefix+'-'+name,'data-planner-field':'technical.'+name,'aria-invalid':!!errors['technical.'+name],'aria-describedby':errors['technical.'+name]?prefix+'-'+name+'-error':undefined});
 const number=(raw:string)=>raw===''?null:Number(raw);
 const set=(name:keyof TechnicalProfile,next:unknown)=>onChange({...value,[name]:next});
 const band=weightBand(value.f1);
 return <fieldset className="vehicle-details workspace-fieldset"><legend>{t('Datele din talon')}</legend>
 <FormField {...field('kind','Tip vehicul')}><select {...attrs('kind')} value={value.kind} onChange={e=>onChange({...value,kind:e.target.value as TechnicalProfile['kind'],category:'unknown'})}>{Object.entries(kindLabels).map(([key,label])=><option key={key} value={key}>{t(label)}</option>)}</select></FormField>
 <div className="weight-bands" aria-live="polite"><span className={band==='light'?'active':''}>{t('Până la 3,5 t inclusiv')}</span><span className={band==='heavy'?'active':''}>{t('Peste 3,5 t')}</span></div>
 <small>{t('Încadrarea se actualizează după masa din talon. Regulile diferă între țări.')}</small>
 <div className="date-pair">
 <FormField {...field('f1','Masa F.1 (kg)')}><input {...attrs('f1')} type="number" min={1} max={200000} step={1} value={value.f1??''} onChange={e=>set('f1',number(e.target.value))} placeholder="3500"/></FormField>
 <FormField {...field('f2','Masa F.2 (kg)')}><input {...attrs('f2')} type="number" min={1} max={200000} step={1} value={value.f2??''} onChange={e=>set('f2',number(e.target.value))}/></FormField>
 </div><small>{t('F.1: masa maximă tehnică. F.2: masa maximă autorizată. Nu greutatea măsurată la plecare.')}</small>
 <div className="date-pair">
 <FormField {...field('category','Categoria J')}><select {...attrs('category')} value={value.category} onChange={e=>set('category',e.target.value)}>{['unknown','M1','M1G','N1','N1G','N2','N3','M2','M3'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c}</option>)}</select></FormField>
 <FormField {...field('seats','Locuri S.1 (cu șofer)')}><input {...attrs('seats')} type="number" min={1} max={100} step={1} value={value.seats??''} onChange={e=>set('seats',number(e.target.value))}/></FormField>
 </div>
 <label className="workspace-check"><input type="checkbox" checked={!!value.trailer} onChange={e=>set('trailer',e.target.checked?{plate:'',country:'RO',category:'unknown',f1:null,f2:null,axles:null}:null)}/>{t('Cu remorcă / rulotă / semiremorcă')}</label>
 {value.trailer&&<div className="trailer-fields">
 <FormField {...field('trailer.plate','Numărul remorcii')}><input {...attrs('trailer.plate')} value={value.trailer.plate} maxLength={20} required onChange={e=>set('trailer',{...value.trailer,plate:e.target.value})}/></FormField>
 <FormField {...field('trailer.country','Țara remorcii (cod)')}><input {...attrs('trailer.country')} value={value.trailer.country} minLength={2} maxLength={2} required pattern="[A-Za-z]{2}" onChange={e=>set('trailer',{...value.trailer,country:e.target.value.toUpperCase()})}/></FormField>
 <FormField {...field('trailer.category','Categoria remorcii')}><select {...attrs('trailer.category')} value={value.trailer.category} onChange={e=>set('trailer',{...value.trailer,category:e.target.value})}>{['unknown','O1','O2','O3','O4'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c}</option>)}</select></FormField>
 <div className="date-pair">{(['f1','f2'] as const).map(name=><FormField key={name} {...field('trailer.'+name,name==='f1'?'Remorcă F.1 (kg)':'Remorcă F.2 (kg)')}><input {...attrs('trailer.'+name)} type="number" min={1} max={200000} step={1} value={value.trailer?.[name]??''} onChange={e=>set('trailer',{...value.trailer,[name]:number(e.target.value)})}/></FormField>)}</div>
 <FormField {...field('trailer.axles','Axe remorcă')}><input {...attrs('trailer.axles')} type="number" min={1} max={10} step={1} value={value.trailer.axles??''} onChange={e=>set('trailer',{...value.trailer,axles:number(e.target.value)})}/></FormField>
 </div>}
 <details><summary>{t('Detalii pentru taxe rutiere')}</summary><div className="date-pair">
 <FormField {...field('axles','Axe vehicul')}><input {...attrs('axles')} type="number" min={2} max={10} step={1} value={value.axles??''} onChange={e=>set('axles',number(e.target.value))}/></FormField>
 <FormField {...field('euro','Norma Euro')}><select {...attrs('euro')} value={value.euro} onChange={e=>set('euro',e.target.value)}>{['unknown','0','1','2','3','4','5','6','electric'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c==='electric'?t('Electric'):c}</option>)}</select></FormField>
 <FormField {...field('co2Class','Clasa CO₂')}><select {...attrs('co2Class')} value={value.co2Class??''} onChange={e=>set('co2Class',number(e.target.value))}><option value="">{t('De verificat')}</option>{[1,2,3,4,5].map(c=><option key={c}>{c}</option>)}</select></FormField>
 <FormField {...field('frontHeightMm','Înălțime la axa față (mm)')}><input {...attrs('frontHeightMm')} type="number" min={100} max={5000} step={1} value={value.frontHeightMm??''} onChange={e=>set('frontHeightMm',number(e.target.value))}/></FormField>
 </div></details><input type="hidden" name="technical" value={JSON.stringify(value)}/>
 </fieldset>;
}
