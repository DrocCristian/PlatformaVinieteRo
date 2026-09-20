import 'server-only';
import hu from './purchase/hu.json';
import de from './purchase/de.json';
import it from './purchase/it.json';
import ru from './purchase/ru.json';
import pl from './purchase/pl.json';
import bg from './purchase/bg.json';
import cs from './purchase/cs.json';
import sk from './purchase/sk.json';
import el from './purchase/el.json';
import {getMessages} from './dictionaries';
import type {Locale,Messages} from './public';
export function purchaseMessages(locale:Locale):Messages{return locale==='ro'?{}:{...getMessages(locale),...{hu,de,it,ru,pl,bg,cs,sk,el}[locale]};}
