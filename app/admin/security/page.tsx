import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff,getUser} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';
import {unseal,qrSvg,otpauthUrl} from '@/lib/security';import {emailReady} from '@/lib/email';
import {startTwoStepSetup,confirmTwoStepSetup,turnOffTwoStep,newBackupCodesAction,setRequireTwoStep} from '@/app/auth-actions';
export const metadata={title:'Security · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const M:Record<string,[string,'ok'|'error']>={code:['That code isn’t right. Use the newest code in your app.','error'],required:['Two-step sign-in is required for the team. Please turn it on below.','error'],selffirst:['Turn on two-step sign-in for yourself first.','error'],backupused:['You signed in with a backup code. Each code works once; make new ones below if you are running low.','ok'],off:['Two-step sign-in is off.','ok'],'1':['Saved.','ok']};
export default async function Security({searchParams}:{searchParams:Promise<{setup?:string;codes?:string;e?:string;saved?:string}>}){
 const me=await requireStaff();const {setup,codes,e,saved}=await searchParams;const u=await getUser(me.email);const on=u?.tfa==='on';
 const pending=setup?unseal(u?.tfaPending):null;
 let shown:string[]=[];if(codes){const box=await kv<string|null>('GET','tfa:show:'+me.email);if(box){shown=(unseal(box)||'').split(',').filter(Boolean);await kv('DEL','tfa:show:'+me.email);}}
 const left=on&&u?.tfaBackup?JSON.parse(u.tfaBackup).length:0;
 const required=(await kv('GET','settings:require2fa'))==='yes';
 const team=me.role==='owner'?(await Promise.all(((await kv<string[]>('SMEMBERS','users:staff'))||[]).map(x=>hgetall('user:'+x)))).filter(p=>p.email):[];
 const m=M[e||saved||''];
 return <AdminShell user={me} active="/admin/security" eyebrow="Your sign-in" title="Security">
  {m&&<AdmNotice kind={m[1]}>{m[0]}</AdmNotice>}
  {shown.length>0&&<section className="adm-card tfa-codes"><h2>Your backup codes</h2><p>Each code signs you in once if you don’t have your phone. <b>Save them now</b> (print them or keep them in a password manager). They won’t be shown again.</p><ol>{shown.map(c=><li key={c}><code>{c}</code></li>)}</ol></section>}
  <section className="adm-card"><h2>Two-step sign-in {on?<span className="adm-status s-live">on</span>:<span className="adm-status s-draft">off</span>}</h2>
   {on?<><p>Signing in needs your password <b>and</b> a 6-digit code from your authenticator app. {left} backup {left===1?'code':'codes'} left.</p>
     <div className="tfa-row"><form action={newBackupCodesAction} className="tfa-inline"><input name="code" inputMode="numeric" placeholder="6-digit code" aria-label="Code from your app" required/><button className="adm-btn ghost">Make new backup codes</button></form>
     {!required&&<form action={turnOffTwoStep} className="tfa-inline"><input name="code" inputMode="numeric" placeholder="6-digit code" aria-label="Code from your app" required/><button className="adm-btn ghost">Turn off</button></form>}</div></>
   :pending?<div className="tfa-setup"><div className="tfa-qr" dangerouslySetInnerHTML={{__html:qrSvg(otpauthUrl(me.email,pending))}}/>
     <div><ol className="tfa-steps"><li>Install an authenticator app on your phone, such as <b>Google Authenticator</b>, <b>Microsoft Authenticator</b> or <b>1Password</b>.</li><li>In the app, add an account and scan this QR code. On your phone? <a href={otpauthUrl(me.email,pending)}>Tap here to add it</a>.</li><li>Can’t scan? Enter this key: <code className="adm-code">{pending.replace(/(.{4})/g,'$1 ').trim()}</code></li><li>Type the 6-digit code the app shows:</li></ol>
      <form action={confirmTwoStepSetup} className="tfa-inline"><input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="6-digit code" required autoFocus/><button className="pill">Turn on <span>↗</span></button></form></div></div>
   :<><p>Add a second check when you sign in: a 6-digit code from an app on your phone. Even if someone learns your password, they can’t get in without your phone. It takes about a minute to set up.</p><form action={startTwoStepSetup}><button className="pill">Set up two-step sign-in <span>↗</span></button></form></>}
  </section>
  {me.role==='owner'&&<section className="adm-card"><h2>Team policy</h2>
   <p>{required?'Everyone on the team must use two-step sign-in. New team members are asked to set it up when they first sign in.':'Recommended: require everyone on the team to use two-step sign-in.'}</p>
   <ul className="adm-people tfa-team">{team.map(p=><li key={p.email}><span><b>{p.name}</b><small>{p.email}</small></span><span className={'adm-status '+(p.tfa==='on'?'s-live':'s-draft')}>{p.tfa==='on'?'two-step on':'password only'}</span></li>)}</ul>
   <form action={setRequireTwoStep}><input type="hidden" name="on" value={required?'0':'1'}/><button className={required?'adm-btn ghost':'adm-btn'}>{required?'Stop requiring it':'Require two-step sign-in for everyone'}</button></form></section>}
  <section className="adm-card"><h2>Password</h2><p>Change your password in <a href="/admin/settings">Settings</a>. Forgotten it? Use “Forgotten your password?” on the sign-in page{emailReady?'':' (email reset switches on once email sending is connected)'}.</p></section>
 </AdminShell>;
}
