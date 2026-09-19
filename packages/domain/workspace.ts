import {z} from 'zod';
import {vehicleSchema} from './account.ts';
import {isCalendarDate,localToday} from './catalog.ts';
export const destinationSchema=z.object({
 country:z.enum(['AT','HU','RO','BG','CZ','SK','SI','CH','MD']),
 entry:z.string().refine(isCalendarDate,'Data intrării nu este validă.'),
 exit:z.string().refine(isCalendarDate,'Data ieșirii nu este validă.')
}).refine(v=>v.exit>=v.entry,'Ieșirea trebuie să fie după intrare.');
export const destinationsSchema=z.array(destinationSchema).min(1).max(9).refine(v=>new Set(v.map(x=>x.country)).size===v.length,'O țară poate apărea o singură dată.');
export const journeySchema=z.object({
 title:z.string().trim().min(1,'Introdu un nume pentru călătorie.').max(80),
 plate:vehicleSchema.shape.plate,registration_country:vehicleSchema.shape.registration_country,
 destinations:destinationsSchema
}).refine(v=>v.destinations.every(d=>d.entry>=localToday()),'Datele de plecare nu pot fi în trecut.');
export const supportSchema=z.object({
 subject:z.string().trim().min(3,'Subiectul trebuie să aibă minimum 3 caractere.').max(120),
 message:z.string().trim().min(10,'Descrie solicitarea în minimum 10 caractere.').max(4000),
 kind:z.enum(['general','fine','privacy']),
 deadline:z.union([z.literal(''),z.string().refine(isCalendarDate,'Termenul nu este valid.')]).transform(v=>v||null)
});

