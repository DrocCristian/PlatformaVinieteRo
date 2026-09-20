'use client';
import {useId} from 'react';
import {translator,type Messages} from '../packages/i18n/public';
import type {FieldErrors} from '../packages/domain/planner-validation';
import FormField from './form-field';
export type RouteDraft={origin:string;destination:string;departure:string;returnDate:string};
export const emptyRoute:RouteDraft={origin:'',destination:'',departure:'',returnDate:''};
export default function RouteFields({value,onChange,messages={},errors={}}:{value:RouteDraft;onChange:(v:RouteDraft)=>void;messages?:Messages;errors?:FieldErrors}){
 const t=translator(messages);
 const prefix=useId();
 const field=(name:string,label:string)=>({id:prefix+'-'+name,label:t(label),error:errors['route.'+name]?t(errors['route.'+name]):undefined});
 const attrs=(name:string)=>({id:prefix+'-'+name,'data-planner-field':'route.'+name,'aria-invalid':!!errors['route.'+name],'aria-describedby':errors['route.'+name]?prefix+'-'+name+'-error':undefined});
 return <fieldset className="workspace-fieldset route-fields"><legend>{t('Cursa ta')}</legend>
 <FormField {...field('origin','De unde pleci?')}><input {...attrs('origin')} name="origin" value={value.origin} onChange={e=>onChange({...value,origin:e.target.value})} maxLength={200} placeholder={t('Localitate, țară sau adresă')}/></FormField>
 <FormField {...field('destination','Unde ajungi?')}><input {...attrs('destination')} name="destination" value={value.destination} onChange={e=>onChange({...value,destination:e.target.value})} maxLength={200} placeholder={t('Localitate, țară sau adresă')}/></FormField>
 <div className="date-pair">
 <FormField {...field('departure','Plecare')}><input {...attrs('departure')} name="departure" type="date" value={value.departure} onChange={e=>onChange({...value,departure:e.target.value})}/></FormField>
 <FormField {...field('returnDate','Ultima zi a călătoriei')}><input {...attrs('returnDate')} name="returnDate" type="date" value={value.returnDate} onChange={e=>onChange({...value,returnDate:e.target.value})}/></FormField>
 </div>
 <small>{t('Calculul traseului și al totalului așteaptă activarea serviciului de rutare și a tarifelor autorizate.')}</small>
 </fieldset>;
}
