export const locales = ['ro','hu','de','it','ru','pl','bg','cs','sk','el'] as const;
export type Locale = typeof locales[number];
export type Messages = Record<string,string>;
export function isLocale(value:string):value is Locale{return locales.some(locale=>locale===value);}
export function localizedPath(locale:Locale,path=''){return (locale==='ro'?'':'/'+locale)+path||'/';}
export function translator(messages:Messages={}){return (text:string):string=>{const key=text.trim();return Object.hasOwn(messages,key)?text.replace(key,messages[key]):text;};}
