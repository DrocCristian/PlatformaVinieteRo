import {z} from 'zod';
import {isCalendarDate,localToday} from './catalog.ts';
export const routeRecordSchema=z.object({
 origin:z.string().trim().min(2,'Introdu locul de plecare.').max(200),
 destination:z.string().trim().min(2,'Introdu destinația.').max(200),
 departure:z.string().refine(isCalendarDate,'Verifică data plecării.'),
 returnDate:z.string().refine(isCalendarDate,'Verifică ultima zi a călătoriei.')
}).refine(v=>v.origin.toLocaleLowerCase()!==v.destination.toLocaleLowerCase(),'Plecarea și destinația trebuie să fie diferite.')
.refine(v=>v.returnDate>=v.departure,'Ultima zi trebuie să fie după plecare.')
;
export const routeRequestSchema=routeRecordSchema.refine(v=>v.departure>=localToday(),'Data plecării nu poate fi în trecut.');
export type RouteRequest=z.infer<typeof routeRequestSchema>;
// This state is deliberately not a numeric quote. A missing service must never become a zero-price trip.
export function pendingRouteQuote(){return {status:'unavailable' as const,totalMinor:null,currency:null,canPay:false,reason:'routing_and_authorized_tariffs_required' as const};}
