import Link from 'next/link';
import {locales,localizedPath,translator,type Locale,type Messages} from '../packages/i18n/public';
const names={ro:'Română',hu:'Magyar',de:'Deutsch',it:'Italiano'};
export default function LanguageLinks({locale,path='',messages={}}:{locale:Locale;path?:string;messages?:Messages}){
 return <nav className="locale-links" aria-label={translator(messages)('Limba site-ului')}>{locales.map(language=><Link key={language} href={localizedPath(language,path)} hrefLang={language} lang={language} aria-current={locale===language?'page':undefined}>{names[language]}</Link>)}</nav>;
}
