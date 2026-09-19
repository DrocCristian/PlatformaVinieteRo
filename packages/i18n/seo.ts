import type {Metadata} from 'next';
import {locales,localizedPath,type Locale,type Messages,translator} from './public';
export const siteUrl='https://vignexo.com';
export const indexingEnabled=process.env.PUBLIC_INDEXING_ENABLED==='true';
export function languageAlternates(path=''){
 return {'ro-RO':siteUrl+localizedPath('ro',path),hu:siteUrl+localizedPath('hu',path),'hu-HU':siteUrl+localizedPath('hu',path),de:siteUrl+localizedPath('de',path),'de-AT':siteUrl+localizedPath('de',path),'de-DE':siteUrl+localizedPath('de',path),it:siteUrl+localizedPath('it',path),'it-IT':siteUrl+localizedPath('it',path),ro:siteUrl+localizedPath('ro',path),'x-default':siteUrl+localizedPath('ro',path)};
}
export function publicMetadata(locale:Locale,messages:Messages={},path=''):Metadata{
 const t=translator(messages);
 return {title:t(path? 'Catalogul vinietelor':'Călătoria începe aici')+' · Vignexo',description:t(path?'Verifică disponibilitatea pentru fiecare destinație. Achiziția se va activa separat pentru fiecare țară.':'Planifică vinietele pentru călătoria ta europeană. Versiune de previzualizare.'),alternates:{canonical:siteUrl+localizedPath(locale,path),languages:languageAlternates(path)},robots:{index:indexingEnabled,follow:indexingEnabled}};
}
export function publicUrls(){return locales.flatMap(locale=>['','/catalog'].map(path=>({url:siteUrl+localizedPath(locale,path),alternates:{languages:languageAlternates(path)}})));}
