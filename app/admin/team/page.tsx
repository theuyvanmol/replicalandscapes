import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';import {addStaff,removeStaff} from '@/app/admin/actions';import {resetTeamTwoStep} from '@/app/auth-actions';
export const metadata={title:'Team · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={details:['Add a name, a valid email and a role.','error'],password:['The temporary password needs at least 10 characters.','error'],exists:['That person is already on the team.','error'],role:['Only the owner can add admins.','error'],remove:['That person can’t be removed.','error'],added:['Team member added. Send them their email and temporary password, and ask them to change it in Settings.','ok'],removed:['Team member removed. They’re signed out straight away.','ok'],tfareset:['Two-step sign-in reset. They can sign in with their password and set it up again.','ok']};
const ROLE:Record<string,string>={owner:'Owner: everything, including the team',admin:'Admin: products, customers and team',editor:'Editor: products and website content'};
export default async function Team({searchParams}:{searchParams:Promise<{e?:string;saved?:string}>}){
 const u=await requireStaff(['owner','admin']);const {e,saved}=await searchParams;const m=MSG[e||saved||''];
 const emails=(await kv<string[]>('SMEMBERS','users:staff'))||[];
 const team=(await Promise.all(emails.map(x=>hgetall('user:'+x)))).filter(p=>p.email).sort((a,b)=>['owner','admin','editor'].indexOf(a.role)-['owner','admin','editor'].indexOf(b.role));
 return <AdminShell user={u} active="/admin/team" eyebrow={team.length+' people'} title="Team">
  {m&&<AdmNotice kind={m[1]}>{m[0]}</AdmNotice>}
  <div className="adm-cols">
   <section className="adm-card adm-wide"><h2>Who has access</h2><ul className="adm-people">{team.map(p=><li key={p.email}><span className="adm-avatar" aria-hidden="true">{p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><span><b>{p.name}{p.email===u.email?' (you)':''}</b><small>{p.email} · last sign-in {p.lastLogin?new Date(p.lastLogin).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'never'}</small></span><span className={'adm-role r-'+p.role}>{p.role}</span>
    {p.role!=='owner'&&p.email!==u.email&&(p.role!=='admin'||u.role==='owner')&&<>{p.tfa==='on'&&<form action={resetTeamTwoStep}><input type="hidden" name="email" value={p.email}/><button className="adm-remove" aria-label={'Reset two-step sign-in for '+p.name}>Reset 2-step</button></form>}<form action={removeStaff}><input type="hidden" name="email" value={p.email}/><button className="adm-remove" aria-label={'Remove '+p.name}>Remove</button></form></>}</li>)}</ul></section>
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
