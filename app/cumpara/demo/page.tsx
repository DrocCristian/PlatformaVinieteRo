import PurchaseDemo from '../../../components/purchase-demo';
import {isLocale} from '../../../packages/i18n/public';
import {purchaseMessages} from '../../../packages/i18n/purchase';
import './style.css';
export const metadata={title:'Vignexo — pregătește vinietele',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const q=await searchParams,locale=q.lang&&isLocale(q.lang)?q.lang:'ro';
 return <PurchaseDemo locale={locale} messages={purchaseMessages(locale)}/>;
}
