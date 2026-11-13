import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {changeStaffPassword} from '@/app/admin/actions';
export const metadata={title:'Settings · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={current:['Your current password isn’t right.','error'],password:['Your new password needs at least 10 characters.','error']};
export default async function Settings({searchParams}:{searchParams:Promise<{e?:string;saved?:string}>}){
 const u=await requireStaff();const {e,saved}=await searchParams;
 return <AdminShell user={u} active="/admin/settings" title="Settings">
  {saved&&<AdmNotice>Password changed. Other devices have been signed out.</AdmNotice>}{e&&MSG[e]&&<AdmNotice kind={MSG[e][1]}>{MSG[e][0]}</AdmNotice>}
  <div className="adm-cols">
   <section className="adm-card"><h2>Your profile</h2><dl className="adm-dl"><dt>Name</dt><dd>{u.name}</dd><dt>Email</dt><dd>{u.email}</dd><dt>Role</dt><dd className="cap">{u.role}</dd></dl></section>
   <section className="adm-card"><h2>Change password</h2><form action={changeStaffPassword} className="auth-form compact">
    <label htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" required/>
    <label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required/>
    <button className="pill auth-submit">Change password</button></form></section>
  </div>
 </AdminShell>;
}
