import AdminAuth from '@/components/AdminAuth';import {Notice} from '@/components/AuthLayout';import {verifyTwoStep} from '@/app/auth-actions';
export const metadata={title:'Two-step sign-in',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const M:Record<string,string>={code:'That code isn’t right. Codes change every 30 seconds, so try the newest one.',slow:'Too many attempts. Please wait 15 minutes.'};
export default async function Verify({searchParams}:{searchParams:Promise<{e?:string}>}){const {e}=await searchParams;
 return <AdminAuth title={<>One more<br/><em>step.</em></>} lead="Open your authenticator app and enter the 6-digit code for Replica Landscapes.">
  {e&&M[e]&&<Notice kind="error">{M[e]}</Notice>}
  <form action={verifyTwoStep} className="auth-form"><label htmlFor="code">6-digit code</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}|[A-Za-z0-9]{5}-?[A-Za-z0-9]{5}" autoFocus required className="tfa-input"/>
   <button className="pill auth-submit">Verify and sign in <span aria-hidden="true">↗</span></button></form>
  <p className="auth-small">Lost your phone? Enter one of your backup codes instead, or ask the account owner to reset your two-step sign-in.</p></AdminAuth>;}
