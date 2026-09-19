import {AuthForm} from '../../../components/account-forms';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 return <>{error&&<p role="alert" className="account-error">Linkul nu a putut fi confirmat. Poate fi expirat sau deschis în alt browser. Solicită un link nou.</p>}<AuthForm mode="login"/></>;
}