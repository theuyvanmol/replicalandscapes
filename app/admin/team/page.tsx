import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';import {addStaff,removeStaff,saveAlerts,turnOnOrderAlerts} from '@/app/admin/actions';import {emailReady} from '@/lib/email';import {orderAlertsOn} from '@/lib/order-alerts';import {adminReady} from '@/lib/shopify-admin';import {resetTeamTwoStep} from '@/app/auth-actions';
export const metadata={title:'Team · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={alerts:['Email alerts saved.','ok'],hook:['New-order emails are on. Shopify will tell the site about every order.','ok'],details:['Add a name, a valid email and a role.','error'],password:['The temporary password needs at least 10 characters.','error'],exists:['That person is already on the team.','error'],role:['Only the owner can add admins.','error'],remove:['That person can’t be removed.','error'],added:['Team member added. Send them their email and temporary password, and ask them to change it in Settings.','ok'],removed:['Team member removed. They’re signed out straight away.','ok'],tfareset:['Two-step sign-in reset. They can sign in with their password and set it up again.','ok']};
const ROLE:Record<string,string>={owner:'Owner: everything, including the team',admin:'Admin: products, customers and team',editor:'Editor: products and website content'};
export default async function Team({searchParams}:{searchParams:Promise<{e?:string;saved?:string;m?:string}>}){
 const u=await requireStaff(['owner','admin']);const {e,saved,m:hm}=await searchParams;const m=e==='hook'?['Couldn’t turn on new-order emails: '+(hm||'Shopify refused.'),'error'] as [string,'ok'|'error']:MSG[e||saved||''];const hookOn=await orderAlertsOn();
 const emails=(await kv<string[]>('SMEMBERS','users:staff'))||[];
 const team=(await Promise.all(emails.map(x=>hgetall('user:'+x)))).filter(p=>p.email).sort((a,b)=>['owner','admin','editor'].indexOf(a.role)-['owner','admin','editor'].indexOf(b.role));
 return <AdminShell user={u} active="/admin/team" eyebrow={team.length+' people'} title="Team">
  {m&&<AdmNotice kind={m[1]}>{m[0]}</AdmNotice>}
  <div className="adm-cols">
   <section className="adm-card adm-wide"><h2>Who has access</h2><ul className="adm-people">{team.map(p=><li key={p.email}><span className="adm-avatar" aria-hidden="true">{p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><span><b>{p.name}{p.email===u.email?' (you)':''}</b><small>{p.email} · last sign-in {p.lastLogin?new Date(p.lastLogin).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'never'}</small></span><span className={'adm-role r-'+p.role}>{p.role}</span>
    {p.role!=='owner'&&p.email!==u.email&&(p.role!=='admin'||u.role==='owner')&&<>{p.tfa==='on'&&<form action={resetTeamTwoStep}><input type="hidden" name="email" value={p.email}/><button className="adm-remove" aria-label={'Reset two-step sign-in for '+p.name}>Reset 2-step</button></form>}<form action={removeStaff}><input type="hidden" name="email" value={p.email}/><button className="adm-remove" aria-label={'Remove '+p.name}>Remove</button></form></>}</li>)}</ul></section>
   <section className="adm-card adm-wide" id="alerts"><h2>Email alerts</h2>
    <p className="adm-note">Everyone ticked below gets an email the moment a customer sends an enquiry or places an order. Replying to an enquiry email goes straight to the customer.</p>
    {!emailReady&&<AdmNotice kind="error">Emails can’t go out yet: email sending (Resend) isn’t connected. Add RESEND_API_KEY and EMAIL_FROM in Vercel, then these alerts start automatically.</AdmNotice>}
    <div className="adm-hook">{hookOn?<span className="adm-pill ok">● New-order emails connected to Shopify</span>:adminReady?<form action={turnOnOrderAlerts}><button className="pill">Turn on new-order emails ↗</button><span className="auth-hint">Connects Shopify so the site hears about every new order.</span></form>:<span className="adm-pill">Connect Shopify first to get order emails</span>}</div>
    <form action={saveAlerts} className="adm-alerts"><table><thead><tr><th>Team member</th><th>New enquiries</th><th>New orders</th></tr></thead><tbody>{team.map(p=><tr key={p.email}><td><b>{p.name}</b><small>{p.email}</small></td><td><input type="checkbox" name={'enquiries:'+p.email} defaultChecked={p.mute_enquiries!=='1'} aria-label={'Enquiry emails for '+p.name}/></td><td><input type="checkbox" name={'orders:'+p.email} defaultChecked={p.mute_orders!=='1'} aria-label={'Order emails for '+p.name}/></td></tr>)}</tbody></table><button className="pill">Save alerts</button></form>
   </section>
   <section className="adm-card"><h2>Add a team member</h2><form action={addStaff} className="auth-form compact">
    <label htmlFor="name">Name</label><input id="name" name="name" required/>
    <label htmlFor="email">Work email</label><input id="email" name="email" type="email" required/>
    <label htmlFor="role">Role</label><select id="role" name="role" defaultValue="editor"><option value="editor">Editor</option>{u.role==='owner'&&<option value="admin">Admin</option>}{u.role==='owner'&&<option value="owner">Owner (full access, like you)</option>}</select>
    <label htmlFor="password">Temporary password</label><input id="password" name="password" type="text" minLength={10} autoComplete="off" required/><span className="auth-hint">At least 10 characters. They change it after signing in.</span>
    <button className="pill auth-submit">Add to team</button></form></section>
   <section className="adm-card"><h2>Roles</h2><ul className="adm-roles">{Object.entries(ROLE).map(([k,v])=><li key={k}><span className={'adm-role r-'+k}>{k}</span>{v.split(': ')[1]}</li>)}</ul></section>
  </div>
 </AdminShell>;
}
