import AdminAuth from '@/components/AdminAuth';import {ForgotForm} from '@/components/ResetForms';
export const metadata={title:'Reset your password',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Forgot({searchParams}:{searchParams:Promise<{sent?:string;e?:string}>}){const {sent,e}=await searchParams;
 return <AdminAuth title={<>Reset your<br/><em>password.</em></>} lead="We’ll email a one-time link to your work address."><ForgotForm team sent={!!sent} e={e}/><p className="auth-small"><a href="/admin/login">Back to sign in</a></p></AdminAuth>;}
