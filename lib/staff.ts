import 'server-only';
import {currentUser} from './current-user';
import {redirect} from 'next/navigation';
export async function requireStaff(roles:readonly string[]){
 const {db,user}=await currentUser();const role=user.app_metadata?.vignexo_role;
 if(typeof role!=='string'||!roles.includes(role))redirect('/cont');
 const {data,error}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 if(error||data?.currentLevel!=='aal2')redirect('/cont/securitate?required=1');
 return {db,user,role};
}
