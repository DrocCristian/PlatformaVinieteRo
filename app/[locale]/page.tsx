import {notFound} from 'next/navigation';
import Home from '../../components/public-home';
import {isLocale,locales} from '../../packages/i18n/public';
import {getMessages} from '../../packages/i18n/dictionaries';
import {publicMetadata} from '../../packages/i18n/seo';
type Props={params:Promise<{locale:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return locales.filter(locale=>locale!=='ro').map(locale=>({locale}));}
export async function generateMetadata({params}:Props){const {locale}=await params;if(!isLocale(locale)||locale==='ro')notFound();return publicMetadata(locale,getMessages(locale));}
export default async function Page({params}:Props){const {locale}=await params;if(!isLocale(locale)||locale==='ro')notFound();return <Home locale={locale} messages={getMessages(locale)}/>;}
