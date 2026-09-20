import Link from 'next/link';
import {locales,localizedPath,translator,type Locale,type Messages} from '../packages/i18n/public';
const names:Record<Locale,string>={ro:'Română',hu:'Magyar',de:'Deutsch',it:'Italiano',ru:'Русский',pl:'Polski',bg:'Български',cs:'Čeština',sk:'Slovenčina',el:'Ελληνικά'};
function Flag({locale}:{locale:Locale}){
 const stripes:Partial<Record<Locale,string[]>>={hu:['#ce2939','#fff','#477050'],de:['#151515','#dd0000','#ffce00'],ru:['#fff','#0039a6','#d52b1e'],bg:['#fff','#00966e','#d62612'],sk:['#fff','#0b4ea2','#ee1c25']};
 return <svg className="locale-flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false">
 {locale==='ro'||locale==='it'?<><path fill={locale==='ro'?'#002b7f':'#009246'} d="M0 0h10v20H0z"/><path fill={locale==='ro'?'#fcd116':'#fff'} d="M10 0h10v20H10z"/><path fill={locale==='ro'?'#ce1126':'#ce2b37'} d="M20 0h10v20H20z"/></>:null}
 {stripes[locale]?.map((color,i)=><path key={i} fill={color} d={'M0 '+i*20/3+'h30v'+(20/3+.01)+'H0z'}/>)}
 {locale==='pl'||locale==='cs'?<><path fill="#fff" d="M0 0h30v10H0z"/><path fill="#d7141a" d="M0 10h30v10H0z"/>{locale==='cs'?<path fill="#11457e" d="M0 0l15 10L0 20z"/>:null}</>:null}
 {locale==='sk'?<><path fill="#ee1c25" stroke="#fff" strokeWidth=".7" d="M7 4h10v7c0 3-5 5-5 5s-5-2-5-5z"/><path stroke="#fff" strokeWidth="1.2" d="M12 5v8M9.5 7h5M8.8 9.5h6.4"/><path fill="#0b4ea2" d="M8 12q1-2 2.3 0q1.7-4 3.4 0q1.3-2 2.3 0q-1.5 2.5-4 3.3Q9.5 14.5 8 12"/></>:null}
 {locale==='el'?<><path fill="#fff" d="M0 0h30v20H0z"/>{[0,2,4,6,8].map(i=><path key={i} fill="#0d5eaf" d={'M0 '+i*20/9+'h30v'+20/9+'H0z'}/>)}<path fill="#0d5eaf" d="M0 0h11.11v11.11H0z"/><path fill="#fff" d="M4.44 0h2.23v11.11H4.44zM0 4.44h11.11v2.23H0z"/></>:null}
 </svg>;
}
export default function LanguageLinks({locale,path='',messages={},queryPath}:{locale:Locale;path?:string;messages?:Messages;queryPath?:string}){
 const label=translator(messages)('Limba site-ului');
 return <div className="locale-links"><details className="locale-selector" key={locale+path}>
 <summary aria-label={label+': '+names[locale]}><Flag locale={locale}/><span lang={locale}>{names[locale]}</span><span className="locale-chevron" aria-hidden="true">⌄</span></summary>
 <nav className="locale-options" aria-label={label}>{locales.map(language=><Link key={language} prefetch={false} href={queryPath?queryPath+(queryPath.includes('?')?'&':'?')+'lang='+language:localizedPath(language,path)} hrefLang={language} lang={language} aria-current={locale===language?'page':undefined}><Flag locale={language}/><span>{names[language]}</span>{locale===language?<span className="locale-check" aria-hidden="true">✓</span>:null}</Link>)}</nav>
 </details></div>;
}
