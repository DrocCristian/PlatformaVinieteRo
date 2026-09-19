import Link from 'next/link';
import {currentUser} from '../../../../lib/current-user';
import {MfaForm} from '../../../../components/mfa-form';
export default async function Security(){
 const {db,user}=await currentUser();const [factors,level]=await Promise.all([db.auth.mfa.listFactors(),db.auth.mfa.getAuthenticatorAssuranceLevel()]);
 return <><h1>Securitatea contului</h1><p>Administrarea necesită autentificare în doi pași la fiecare sesiune. Păstrează accesul la aplicația de autentificare.</p>{factors.error||level.error?<p role="alert">Setările nu au putut fi încărcate.</p>:<><p>{level.data.currentLevel==='aal2'?'Sesiune verificată în doi pași.':'Sesiunea trebuie verificată cu un cod din autentificator.'}</p><MfaForm verifiedFactor={factors.data.totp.find(f=>f.status==='verified')?.id}/></>}{user.app_metadata?.vignexo_role&&<Link href="/cont/administrare">Deschide administrarea</Link>}</>;
}
