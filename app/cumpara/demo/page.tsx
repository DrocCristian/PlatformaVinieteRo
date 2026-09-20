import PurchaseDemo from '../../../components/purchase-demo';
import Link from 'next/link';
import LanguageLinks from '../../../components/language-links';
import {isLocale} from '../../../packages/i18n/public';
import {purchaseMessages} from '../../../packages/i18n/purchase';
import './style.css';
export const metadata={title:'Vignexo — pregătește vinietele',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const q=await searchParams,locale=q.lang&&isLocale(q.lang)?q.lang:'ro';
 return <><nav className="purchase-demo purchase-main" aria-label="Language"><LanguageLinks locale={locale} messages={purchaseMessages(locale)} queryPath="/cumpara/demo"/><Link href="/cumpara/flota-demo">Business demo</Link></nav><PurchaseDemo locale={locale} messages={purchaseMessages(locale)}/></>;
}
