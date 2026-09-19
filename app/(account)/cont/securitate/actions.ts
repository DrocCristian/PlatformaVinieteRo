'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {currentUser} from '../../../../lib/current-user';
export type MfaState={error?:string;success?:string;factorId?:string;qr?:string;secret?:string};
export async function enrollMfa():Promise<MfaState>{
 const {db}=await currentUser();
 const factors=await db.auth.mfa.listFactors();
 if(factors.error)return {error:'Factorii de securitate nu au putut fi citiți.'};
 if(factors.data.totp.some(f=>f.status==='verified'))return {error:'Ai deja un autentificator activ. Folosește formularul de verificare.'};
 for(const factor of factors.data.all.filter(f=>f.factor_type==='totp'&&f.status==='unverified'))await db.auth.mfa.unenroll({factorId:factor.id});
 const {data,error}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Vignexo'});
 if(error)return {error:'Configurarea nu a reușit. Reîncearcă.'};
 return {factorId:data.id,qr:data.totp.qr_code,secret:data.totp.secret};
}
export async function verifyMfa(_:MfaState,form:FormData):Promise<MfaState>{
 const parsed=z.object({factorId:z.uuid(),code:z.string().regex(/^\d{6}$/)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:'Introdu codul de 6 cifre.'};
 const {db}=await currentUser();
 const {error}=await db.auth.mfa.challengeAndVerify(parsed.data);
 if(error)return {error:'Cod invalid sau expirat. Reîncearcă.'};
 revalidatePath('/cont/securitate');return {success:'Autentificarea în doi pași este verificată pentru această sesiune.'};
}
