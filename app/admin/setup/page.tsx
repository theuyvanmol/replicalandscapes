import AdminAuth from '@/components/AdminAuth';import {Notice} from '@/components/AuthLayout';import {setupOwner} from '@/app/admin/actions';import {kv,kvReady} from '@/lib/kv';import {redirect} from 'next/navigation';
export const metadata={title:'Set up the team area',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,string>={code:'That setup code isn’t right.',details:'Please add your name and a valid email address.',password:'Your password needs at least 10 characters.'};
export default async function Setup({searchParams}:{searchParams:Promise<{e?:string}>}){
 if(!kvReady||Number(await kv('SCARD','users:staff'))>0)redirect('/admin/login');
 const {e}=await searchParams;
 return <AdminAuth title={<>Create the<br/><em>owner account.</em></>} lead="This page only works once. The owner can then add the rest of the team.">
  {e&&MSG[e]&&<Notice>{MSG[e]}</Notice>}
  <form action={setupOwner} className="auth-form"><label htmlFor="code">Setup code</label><input id="code" name="code" autoComplete="off" placeholder="XXXX-XXXX-XXXX" required/>
   <label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" required/>
   <label htmlFor="email">Work email</label><input id="email" name="email" type="email" autoComplete="username" required/>
   <label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required/><span className="auth-hint">At least 10 characters. Use a password manager.</span>
   <button className="pill auth-submit">Create owner account <span aria-hidden="true">↗</span></button></form>
 </AdminAuth>;
}
