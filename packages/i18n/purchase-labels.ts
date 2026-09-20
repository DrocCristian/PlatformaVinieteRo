import type {Locale} from './public';
const annual:Record<Locale,string>={ro:'Anuală',hu:'Éves',de:'Jahresvignette',it:'Annuale',ru:'Годовая',pl:'Roczna',bg:'Годишна',cs:'Roční',sk:'Ročná',el:'Ετήσια'};
const weekend:Record<Locale,string>={ro:'Weekend',hu:'Hétvége',de:'Wochenende',it:'Fine settimana',ru:'Выходные',pl:'Weekend',bg:'Уикенд',cs:'Víkend',sk:'Víkend',el:'Σαββατοκύριακο'};
export function durationLabel(id:string,fallback:string,locale:Locale){
 if(fallback==='24 de ore')return new Intl.NumberFormat(locale,{style:'unit',unit:'hour',unitDisplay:'long'}).format(24);
 if(id==='annual')return annual[locale];if(id==='weekend')return weekend[locale];
 if(id==='year')return new Intl.NumberFormat(locale,{style:'unit',unit:'year',unitDisplay:'long'}).format(1);
 if(/^d\d+$/.test(id))return new Intl.NumberFormat(locale,{style:'unit',unit:'day',unitDisplay:'long'}).format(Number(id.slice(1)));
 if(/^m\d+$/.test(id))return new Intl.NumberFormat(locale,{style:'unit',unit:'month',unitDisplay:'long'}).format(Number(id.slice(1)));
 return fallback;
}
