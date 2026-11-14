import AuthLayout from '@/components/AuthLayout';import {ForgotForm} from '@/components/ResetForms';
export const metadata={title:'Reset your password',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Forgot({searchParams}:{searchParams:Promise<{sent?:string;e?:string}>}){const {sent,e}=await searchParams;
 return <AuthLayout eyebrow="Your account" title={<>Forgotten<br/><em>your password?</em></>} lead="Enter your email and we’ll send you a link to choose a new one. Shopped with our previous website? Use the same email to bring your order history across.">
  <ForgotForm sent={!!sent} e={e}/><p className="auth-alt"><a href="/account/login">Back to sign in ↗</a></p></AuthLayout>;}
