import Link from 'next/link';
import {locales,localizedPath,translator,type Locale,type Messages} from '../packages/i18n/public';
const names:Record<Locale,string>={ro:'Română',hu:'Magyar',de:'Deutsch',it:'Italiano',ru:'Русский',pl:'Polski',bg:'Български',cs:'Čeština',sk:'Slovenčina',el:'Ελληνικά'};
export default function LanguageLinks({locale,path='',messages={}}:{locale:Locale;path?:string;messages?:Messages}){
 return <nav className="locale-links" aria-label={translator(messages)('Limba site-ului')}>{locales.map(language=><Link key={language} prefetch={false} href={localizedPath(language,path)} hrefLang={language} lang={language} aria-current={locale===language?'page':undefined}>{names[language]}</Link>)}</nav>;
}
