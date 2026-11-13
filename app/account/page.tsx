import StoreShell from '@/components/StoreShell';import {Notice} from '@/components/AuthLayout';import {requireCustomer} from '@/lib/auth';import {getUser} from '@/lib/auth';import {logout,updateProfile,changePassword} from '@/app/account/actions';import {connected} from '@/lib/shopify';
export const metadata={title:'Your account',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={name:['Please add your name.','error'],current:['Your current password isn’t right.','error'],password:['Your new password needs at least 10 characters.','error']};
export default async function Account({searchParams}:{searchParams:Promise<{e?:string;saved?:string;welcome?:string}>}){
 const u=await requireCustomer();const full=await getUser(u.email) as Record<string,string>|null;const {e,saved,welcome}=await searchParams;
 const first=u.name.split(' ')[0];
 return <StoreShell><div className="account-page">
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Your account</nav>
  <div className="account-head"><div><p className="eyebrow">Your account</p><h1>{welcome?'Welcome, ':'Hello, '}{first}.</h1><p>Signed in as {u.email}</p></div><form action={logout}><button className="account-out">Sign out ↗</button></form></div>
  {welcome&&<Notice kind="ok">Your account is ready. We’ll keep your details safe and you can change them at any time.</Notice>}
  {saved&&<Notice kind="ok">{saved==='pw'?'Password changed.':'Your details are saved.'}</Notice>}
  {e&&MSG[e]&&<Notice kind={MSG[e][1]}>{MSG[e][0]}</Notice>}
  <div className="account-grid">
   <section className="account-card account-orders"><h2>Your orders</h2>{connected?<p>Your recent orders will appear here.</p>:<><p>You haven’t placed an order on the new website yet.</p><p className="auth-small">Orders from our previous website aren’t shown here. Call <a href="tel:01661871481">01661 871481</a> if you need a copy.</p></>}<a className="pill" href="/shop">Browse the collection <span aria-hidden="true">↗</span></a></section>
   <section className="account-card"><h2>Room Studio</h2><p>Plan your planting in 3D before you buy. Your arrangements are saved on this device.</p><a className="account-link-arrow" href="/studio">Open the Room Studio ↗</a></section>
   <section className="account-card"><h2>Your details</h2><form action={updateProfile} className="auth-form compact">
    <label htmlFor="name">Full name</label><input id="name" name="name" defaultValue={u.name} required/>
    <label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" defaultValue={full?.phone||''} autoComplete="tel"/>
    <label htmlFor="company">Company (optional)</label><input id="company" name="company" defaultValue={full?.company||''} autoComplete="organization"/>
    <label className="auth-check"><input type="checkbox" name="marketing" defaultChecked={full?.marketing==='yes'}/> Email me new arrivals and seasonal offers.</label>
    <button className="pill auth-submit">Save details</button></form></section>
   <section className="account-card"><h2>Password</h2><form action={changePassword} className="auth-form compact">
    <label htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" required/>
    <label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required/>
    <button className="pill auth-submit">Change password</button></form></section>
   <section className="account-card account-help"><h2>Bespoke &amp; commercial</h2><p>Planning a hotel, office or restaurant scheme? Our team designs, supplies and installs.</p><a className="account-link-arrow" href="/bespoke-commercial">Start a project ↗</a></section>
  </div>
 </div></StoreShell>;
}
