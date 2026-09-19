import type {Metadata} from 'next';
import {locales,localizedPath,type Locale,type Messages,translator} from './public';
export const siteUrl='https://vignexo.com';
export const indexingEnabled=process.env.PUBLIC_INDEXING_ENABLED==='true';
const regionalAlternates:Partial<Record<Locale,string[]>>={ro:['ro-RO'],hu:['hu-HU'],de:['de-AT','de-DE'],it:['it-IT'],pl:['pl-PL'],bg:['bg-BG'],cs:['cs-CZ'],sk:['sk-SK'],el:['el-GR']};
export function languageAlternates(path=''){
 const languages:Record<string,string>={};
 for(const locale of locales){
  const url=siteUrl+localizedPath(locale,path);
  languages[locale]=url;
  for(const region of regionalAlternates[locale]??[])languages[region]=url;
 }
 languages['x-default']=siteUrl+localizedPath('ro',path);
 return languages;
}
export function publicMetadata(locale:Locale,messages:Messages={},path=''):Metadata{
 const t=translator(messages);
 return {title:t(path? 'Catalogul vinietelor':'Călătoria începe aici')+' · Vignexo',description:t(path?'Verifică disponibilitatea pentru fiecare destinație. Achiziția se va activa separat pentru fiecare țară.':'Planifică vinietele pentru călătoria ta europeană. Versiune de previzualizare.'),alternates:{canonical:siteUrl+localizedPath(locale,path),languages:languageAlternates(path)},robots:{index:indexingEnabled,follow:indexingEnabled}};
}
export function publicUrls(){return locales.flatMap(locale=>['','/catalog'].map(path=>({url:siteUrl+localizedPath(locale,path),alternates:{languages:languageAlternates(path)}})));}
