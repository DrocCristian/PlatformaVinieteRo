import {previewValidity} from '../packages/domain/purchase-validity';
import type {PurchaseVehicle,Selection} from '../packages/domain/purchase-preview';
import {formatTravelDate} from '../packages/domain/catalog';
import type {Locale} from '../packages/i18n/public';

const labels:Record<Locale,[string,string,string,string,string]>={
 ro:['Perioadă estimată','De la','Până la','De confirmat de emitent','Activarea în Austria necesită verificarea canalului de vânzare; poate exista termenul de 18 zile.'],
 de:['Voraussichtlicher Zeitraum','Ab','Bis','Vom Aussteller zu bestätigen','Die Aktivierung in Österreich hängt vom Vertriebskanal ab; eine Frist von 18 Tagen kann gelten.'],
 hu:['Becsült időszak','Kezdet','Vége','A kibocsátó megerősítése szükséges','Az ausztriai aktiválás az értékesítési csatornától függ; 18 napos várakozás lehetséges.'],
 it:['Periodo stimato','Dal','Fino al','Da confermare dall’emittente','L’attivazione in Austria dipende dal canale di vendita; può applicarsi un periodo di 18 giorni.'],
 ru:['Предполагаемый срок','С','До','Требует подтверждения эмитента','Активация в Австрии зависит от канала продажи; возможно ожидание 18 дней.'],
 pl:['Szacowany okres','Od','Do','Do potwierdzenia przez wystawcę','Aktywacja w Austrii zależy od kanału sprzedaży; może obowiązywać okres 18 dni.'],
 bg:['Очакван период','От','До','За потвърждение от издателя','Активирането в Австрия зависи от канала за продажба; възможен е срок от 18 дни.'],
 cs:['Předpokládaná platnost','Od','Do','Musí potvrdit vydavatel','Aktivace v Rakousku závisí na prodejním kanálu; může platit lhůta 18 dní.'],
 sk:['Predpokladaná platnosť','Od','Do','Musí potvrdiť vydavateľ','Aktivácia v Rakúsku závisí od predajného kanála; môže platiť lehota 18 dní.'],
 el:['Εκτιμώμενη περίοδος','Από','Έως','Απαιτείται επιβεβαίωση εκδότη','Η ενεργοποίηση στην Αυστρία εξαρτάται από το κανάλι πώλησης· ενδέχεται να ισχύει αναμονή 18 ημερών.']
};
export default function PurchaseValidity({selection,vehicle,locale}:{selection:Selection;vehicle:PurchaseVehicle;locale:Locale}){
 const value=previewValidity(selection,vehicle);if(!value)return null;
 const [title,from,to,pending,activation]=labels[locale];
 return <div className="purchase-validity"><strong>{title}</strong><dl><div><dt>{from}</dt><dd>{formatTravelDate(value.start)}{selection.time?' · '+selection.time:''}</dd></div><div><dt>{to}</dt><dd>{value.end?formatTravelDate(value.end)+' · 23:59:59':pending}</dd></div></dl><small>{value.zone} · {pending}</small>{value.activationReview&&<p role="note">{activation}</p>}</div>;
}
