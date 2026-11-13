import RegTime from '@/components/RegTime';
import AuthLayout,{Notice} from '@/components/AuthLayout';import {register} from '@/app/account/actions';import {currentCustomer} from '@/lib/auth';import {redirect} from 'next/navigation';
export const metadata={title:'Create an account',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,string>={details:'Please add your name and a valid email address.',password:'Your password needs at least 10 characters.',slow:'Too many attempts. Please wait 15 minutes and try again.'};
export default async function Register({searchParams}:{searchParams:Promise<{e?:string}>}){
 if(await currentCustomer())redirect('/account');const {e}=await searchParams;
 return <AuthLayout eyebrow="Join Replica Landscapes" title={<>Create your<br/><em>account.</em></>} lead="Check out faster, track your orders and keep your planting plans in one place.">
  {e&&MSG[e]&&<Notice>{MSG[e]}</Notice>}
  <form action={register} className="auth-form">
   <label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required/>
   <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required/>
   <label className="ed-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><RegTime/><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required aria-describedby="pwhint"/><span id="pwhint" className="auth-hint">At least 10 characters.</span>
   <label className="auth-check"><input type="checkbox" name="marketing"/> Send me new arrivals and seasonal offers by email. You can unsubscribe at any time.</label>
   <button className="pill auth-submit">Create account <span aria-hidden="true">↗</span></button>
  </form>
  <p className="auth-alt">Already have an account? <a href="/account/login">Sign in ↗</a></p>
 </AuthLayout>;
}
