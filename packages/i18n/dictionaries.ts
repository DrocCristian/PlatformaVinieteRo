import 'server-only';
import de from './de.json';
import hu from './hu.json';
import it from './it.json';
import type {Locale,Messages} from './public';
export function getMessages(locale:Locale):Messages{return locale==='ro'?{}:{de,hu,it}[locale];}
