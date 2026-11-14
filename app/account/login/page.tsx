import AuthLayout,{Notice} from '@/components/AuthLayout';import {login} from '@/app/account/actions';import {currentCustomer} from '@/lib/auth';import {redirect} from 'next/navigation';
export const metadata={title:'Sign in',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,string>={wrong:'That email and password don’t match. Check them and try again.',slow:'Too many attempts. Please wait 15 minutes and try again.',exists:'You already have an account with that email. Sign in below.'};
export default async function Login({searchParams}:{searchParams:Promise<{e?:string;next?:string}>}){
 if(await currentCustomer())redirect('/account');const {e,next}=await searchParams;
 return <AuthLayout eyebrow="Your account" title={<>Welcome<br/><em>back.</em></>} lead="Sign in to see your orders, saved details and Room Studio arrangements.">
  {e&&MSG[e]&&<Notice>{MSG[e]}</Notice>}
  <form action={login} className="auth-form"><input type="hidden" name="next" value={next||''}/>
   <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required/>
   <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required/>
   <button className="pill auth-submit">Sign in <span aria-hidden="true">↗</span></button>
  </form>
  <p className="auth-alt">New to Replica Landscapes? <a href="/account/register">Create an account ↗</a></p>
  <p className="auth-small"><a href="/account/forgot">Forgotten your password?</a> Shopped with our previous website? <a href="/account/forgot">Set a password here</a> using the same email.</p>
  <p className="auth-small auth-staff"><a href="/admin/login">Team sign-in</a></p>
 </AuthLayout>;
}
