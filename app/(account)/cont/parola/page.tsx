import Link from 'next/link';
import {redirect} from 'next/navigation';
import {supabaseServer} from '../../../../lib/supabase/server';
import {PasswordForm} from '../../../../components/account-forms';
export default async function Password(){
 const db=await supabaseServer();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect('/recuperare');
 return <section className="account-card auth-card"><h1>Schimbă parola</h1><PasswordForm/><Link className="account-text-link" href="/cont">Înapoi la cont</Link></section>;
}