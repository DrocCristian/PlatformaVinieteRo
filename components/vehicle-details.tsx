'use client';
import {type TechnicalProfile,weightBand,kindLabels} from '../packages/domain/vehicle-profile';
import {translator,type Messages} from '../packages/i18n/public';
export default function VehicleDetails({value,onChange,messages={}}:{value:TechnicalProfile;onChange:(value:TechnicalProfile)=>void;messages?:Messages}){
 const t=translator(messages);
 const number=(raw:string)=>raw===''?null:Number(raw);
 const set=(field:keyof TechnicalProfile,next:unknown)=>onChange({...value,[field]:next});
 const band=weightBand(value.f1);
 return <fieldset className="vehicle-details workspace-fieldset"><legend>{t('Datele din talon')}</legend>
 <label>{t('Tip vehicul')}<select aria-label={t('Tip vehicul')} value={value.kind} onChange={e=>onChange({...value,kind:e.target.value as TechnicalProfile['kind'],category:'unknown'})}>{Object.entries(kindLabels).map(([key,label])=><option key={key} value={key}>{t(label)}</option>)}</select></label>
 <div className="weight-bands" aria-live="polite"><span className={band==='light'?'active':''}>{t('Până la 3,5 t inclusiv')}</span><span className={band==='heavy'?'active':''}>{t('Peste 3,5 t')}</span></div>
 <small>{t('Încadrarea se actualizează după masa din talon. Regulile diferă între țări.')}</small>
 <div className="date-pair">
 <label>{t('Masa F.1 (kg)')}<input type="number" min={1} max={200000} step={1} value={value.f1??''} onChange={e=>set('f1',number(e.target.value))} placeholder="3500"/></label>
 <label>{t('Masa F.2 (kg)')}<input type="number" min={1} max={200000} step={1} value={value.f2??''} onChange={e=>set('f2',number(e.target.value))}/></label>
 </div><small>{t('F.1: masa maximă tehnică. F.2: masa maximă autorizată. Nu greutatea măsurată la plecare.')}</small>
 <div className="date-pair"><label>{t('Categoria J')}<select aria-label={t('Categoria J')} value={value.category} onChange={e=>set('category',e.target.value)}>{['unknown','M1','M1G','N1','N1G','N2','N3','M2','M3'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c}</option>)}</select></label>
 <label>{t('Locuri S.1 (cu șofer)')}<input type="number" min={1} max={100} step={1} value={value.seats??''} onChange={e=>set('seats',number(e.target.value))}/></label></div>
 <label className="workspace-check"><input type="checkbox" checked={!!value.trailer} onChange={e=>set('trailer',e.target.checked?{plate:'',country:'RO',category:'unknown',f1:null,f2:null,axles:null}:null)}/>{t('Cu remorcă / rulotă / semiremorcă')}</label>
 {value.trailer&&<div className="trailer-fields"><label>{t('Numărul remorcii')}<input value={value.trailer.plate} maxLength={20} required onChange={e=>set('trailer',{...value.trailer,plate:e.target.value})}/></label>
 <label>{t('Țara remorcii (cod)')}<input value={value.trailer.country} minLength={2} maxLength={2} required pattern="[A-Za-z]{2}" onChange={e=>set('trailer',{...value.trailer,country:e.target.value.toUpperCase()})}/></label>
 <label>{t('Categoria remorcii')}<select aria-label={t('Categoria remorcii')} value={value.trailer.category} onChange={e=>set('trailer',{...value.trailer,category:e.target.value})}>{['unknown','O1','O2','O3','O4'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c}</option>)}</select></label>
 <div className="date-pair">{(['f1','f2'] as const).map(field=><label key={field}>{t(field==='f1'?'Remorcă F.1 (kg)':'Remorcă F.2 (kg)')}<input type="number" min={1} max={200000} step={1} value={value.trailer?.[field]??''} onChange={e=>set('trailer',{...value.trailer,[field]:number(e.target.value)})}/></label>)}</div>
 <label>{t('Axe remorcă')}<input type="number" min={1} max={10} step={1} value={value.trailer.axles??''} onChange={e=>set('trailer',{...value.trailer,axles:number(e.target.value)})}/></label></div>}
 <details><summary>{t('Detalii pentru taxe rutiere')}</summary><div className="date-pair">
 <label>{t('Axe vehicul')}<input type="number" min={2} max={10} step={1} value={value.axles??''} onChange={e=>set('axles',number(e.target.value))}/></label>
 <label>{t('Norma Euro')}<select aria-label={t('Norma Euro')} value={value.euro} onChange={e=>set('euro',e.target.value)}>{['unknown','0','1','2','3','4','5','6','electric'].map(c=><option key={c} value={c}>{c==='unknown'?t('De verificat'):c==='electric'?t('Electric'):c}</option>)}</select></label>
 <label>{t('Clasa CO₂')}<select aria-label={t('Clasa CO₂')} value={value.co2Class??''} onChange={e=>set('co2Class',number(e.target.value))}><option value="">{t('De verificat')}</option>{[1,2,3,4,5].map(c=><option key={c}>{c}</option>)}</select></label>
 <label>{t('Înălțime la axa față (mm)')}<input type="number" min={100} max={5000} step={1} value={value.frontHeightMm??''} onChange={e=>set('frontHeightMm',number(e.target.value))}/></label>
 </div></details><input type="hidden" name="technical" value={JSON.stringify(value)}/>
 </fieldset>;
}
