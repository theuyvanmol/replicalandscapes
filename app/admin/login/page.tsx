import AdminAuth from '@/components/AdminAuth';import {Notice} from '@/components/AuthLayout';import {staffLogin} from '@/app/admin/actions';import {currentStaff} from '@/lib/auth';import {kv,kvReady} from '@/lib/kv';import {redirect} from 'next/navigation';
export const metadata={title:'Team sign-in',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={wrong:['That email and password don’t match a team account.','error'],slow:['Too many attempts. Please wait 15 minutes.','error'],out:['You’re signed out.','ok'],expired:['That sign-in took too long. Please start again.','error']};
export default async function StaffLogin({searchParams}:{searchParams:Promise<{e?:string}>}){
 if(!kvReady)return <AdminAuth title="Not available" lead="The team area needs the site database, which isn’t connected."><span/></AdminAuth>;
 if(await currentStaff())redirect('/admin');
 if(Number(await kv('SCARD','users:staff'))===0)redirect('/admin/setup');
 const {e}=await searchParams;
 return <AdminAuth title={<>Team<br/><em>sign-in.</em></>} lead="Manage products, customers and the website.">
  {e&&MSG[e]&&<Notice kind={MSG[e][1]}>{MSG[e][0]}</Notice>}
  <form action={staffLogin} className="auth-form"><label htmlFor="email">Work email</label><input id="email" name="email" type="email" autoComplete="username" required/>
   <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required/>
   <button className="pill auth-submit">Sign in <span aria-hidden="true">↗</span></button></form>
  <p className="auth-small"><a href="/admin/forgot">Forgotten your password?</a> Locked out completely? Ask the account owner.</p>
 </AdminAuth>;
}
