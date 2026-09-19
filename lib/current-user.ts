import 'server-only';
import {redirect} from 'next/navigation';
import {supabaseServer} from './supabase/server';
export async function currentUser(){
 const db=await supabaseServer();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)redirect('/autentificare');
 return {db,user};
}

