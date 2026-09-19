'use client';
import {translator,type Messages} from '../packages/i18n/public';
export type RouteDraft={origin:string;destination:string;departure:string;returnDate:string};
export const emptyRoute:RouteDraft={origin:'',destination:'',departure:'',returnDate:''};
export default function RouteFields({value,onChange,messages={}}:{value:RouteDraft;onChange:(v:RouteDraft)=>void;messages?:Messages}){
 const t=translator(messages);
 return <fieldset className="workspace-fieldset route-fields"><legend>{t('Cursa ta')}</legend>
 <label>{t('De unde pleci?')}<input name="origin" value={value.origin} onChange={e=>onChange({...value,origin:e.target.value})} maxLength={200} placeholder={t('Localitate, țară sau adresă')}/></label>
 <label>{t('Unde ajungi?')}<input name="destination" value={value.destination} onChange={e=>onChange({...value,destination:e.target.value})} maxLength={200} placeholder={t('Localitate, țară sau adresă')}/></label>
 <div className="date-pair"><label>{t('Plecare')}<input name="departure" type="date" value={value.departure} onChange={e=>onChange({...value,departure:e.target.value})}/></label>
 <label>{t('Ultima zi a călătoriei')}<input name="returnDate" type="date" value={value.returnDate} onChange={e=>onChange({...value,returnDate:e.target.value})}/></label></div>
 <small>{t('Calculul traseului și al totalului așteaptă activarea serviciului de rutare și a tarifelor autorizate.')}</small>
 </fieldset>;
}
