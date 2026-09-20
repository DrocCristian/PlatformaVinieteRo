import {z} from 'zod';
import {vinIdentitySchema} from './vehicle-identity.ts';
const positive=z.number().int().min(1).max(200000).nullable();
export const technicalSchema=z.object({
 identity:vinIdentitySchema.optional(),
 kind:z.enum(['car','goods','bus','motorhome']),
 category:z.enum(['M1','M1G','N1','N1G','N2','N3','M2','M3','unknown']),
 f1:positive, f2:positive,
 seats:z.number().int().min(1).max(100).nullable(),
 axles:z.number().int().min(2).max(10).nullable(),
 euro:z.enum(['unknown','0','1','2','3','4','5','6','electric']),
 co2Class:z.number().int().min(1).max(5).nullable(),
 frontHeightMm:z.number().int().min(100).max(5000).nullable(),
 trailer:z.object({
  plate:z.string().trim().toUpperCase().transform(v=>v.replace(/[\s-]+/g,'')).pipe(z.string().regex(/^[A-Z0-9]{2,12}$/)),
  country:z.string().regex(/^[A-Z]{2}$/),
  category:z.enum(['O1','O2','O3','O4','unknown']),
  identity:vinIdentitySchema.optional(),
  f1:positive,f2:positive,
  axles:z.number().int().min(1).max(10).nullable()
 }).nullable()
}).superRefine((v,ctx)=>{
 const issue=(message:string)=>ctx.addIssue({code:'custom',message});
 if(v.f1&&v.f2&&v.f2>v.f1)issue('Masa F.2 nu poate depăși masa F.1.');
 if(v.trailer?.f1&&v.trailer.f2&&v.trailer.f2>v.trailer.f1)issue('Verifică masele remorcii: F.2 nu poate depăși F.1.');
 if(v.kind==='goods'&&!['N1','N1G','N2','N3','unknown'].includes(v.category))issue('Pentru transport de marfă, verifică categoria N din talon.');
 if(v.kind==='bus'&&!['M2','M3','unknown'].includes(v.category))issue('Pentru autobuz, verifică categoria M2/M3 din talon.');
 if(['N2','N3'].includes(v.category)&&v.f1&&v.f1<=3500)issue('Verifică masa vehiculului din categoria N2/N3.');
 if(v.kind==='car'&&!['M1','M1G','unknown'].includes(v.category))issue('Pentru autoturism, verifică categoria M1 din talon.');
 if(['N1','N1G'].includes(v.category)&&v.f1&&v.f1>3500)issue('Categoria N1 este limitată la 3.500 kg. Verifică talonul.');
 if(v.trailer?.category==='O1'&&v.trailer.f1&&v.trailer.f1>750)issue('Categoria O1 este limitată la 750 kg.');
 if(v.trailer?.category==='O2'&&v.trailer.f1&&(v.trailer.f1<=750||v.trailer.f1>3500))issue('Verifică masa și categoria O2 a remorcii.');
});
export type TechnicalProfile=z.infer<typeof technicalSchema>;
export function emptyTechnical():TechnicalProfile{return {kind:'car',category:'unknown',f1:null,f2:null,seats:null,axles:null,euro:'unknown',co2Class:null,frontHeightMm:null,trailer:null};}
export function readTechnical(value:unknown):TechnicalProfile|null{const parsed=technicalSchema.safeParse(value);return parsed.success?parsed.data:null;}
export function weightBand(kg:number|null){return kg===null?'unknown':kg<=3500?'light':'heavy';}
export const kindLabels={car:'Autoturism',goods:'Autoutilitară / camion',bus:'Autobuz / autocar',motorhome:'Autorulotă'} as const;
