import {z} from 'zod';
export const vinIdentitySchema=z.object({
 vin:z.string().trim().toUpperCase().max(32).default(''),
 legacyVin:z.boolean().default(false)
}).superRefine((v,ctx)=>{
 if(v.vin&&!(v.legacyVin?/^[A-Z0-9]{3,32}$/:/^[A-HJ-NPR-Z0-9]{17}$/).test(v.vin))
  ctx.addIssue({code:'custom',path:['vin'],message:'Verifică seria de șasiu: VIN modern de 17 caractere sau seria nestandard declarată explicit.'});
});
