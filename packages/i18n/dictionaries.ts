import 'server-only';
import de from './de.json';
import hu from './hu.json';
import it from './it.json';
import ru from './ru.json';
import pl from './pl.json';
import bg from './bg.json';
import cs from './cs.json';
import sk from './sk.json';
import el from './el.json';
import type {Locale,Messages} from './public';
export function getMessages(locale:Locale):Messages{return locale==='ro'?{}:{de,hu,it,ru,pl,bg,cs,sk,el}[locale];}
