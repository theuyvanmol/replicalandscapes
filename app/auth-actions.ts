'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {kv} from '@/lib/kv';
import {normEmail,validEmail,hashPassword,passwordProblem,startSession,getUser,rateLimited,requireStaff,requireCustomer,audit,STAFF} from '@/lib/auth';
import {newToken,peekToken,burnToken,unseal,seal,checkTotp,useBackupCode,newTotpSecret,newBackupCodes} from '@/lib/security';
import {sendEmail,brandEmail,siteUrl,emailReady} from '@/lib/email';
import {legacyCustomer} from '@/lib/legacy';
import {TFA_COOKIE,sendVerification} from '@/lib/auth-flows';
const str=(fd:FormData,k:string,max=200)=>String(fd.get(k)||'').trim().slice(0,max);

/* ---------- Password reset (customers and team) ---------- */
export async function requestReset(fd:FormData){
 const team=fd.get('team')==='1';const base=team?'/admin':'/account';const email=normEmail(str(fd,'email',254));
 if(!validEmail(email))redirect(base+'/forgot?e=email');
 if(await rateLimited('reset',email))redirect(base+'/forgot?e=slow');
 const u=await getUser(email);
 /* Customers from the old websites have no account here yet: the emailed link lets them set a password and claim it. */
 const legacy=!u&&!team?await legacyCustomer(email):null;
 const ok=(u&&u.pw&&(team?STAFF.includes(u.role):true))||!!legacy;
 if(ok&&emailReady){const t=await newToken('reset',email,3600);
  await sendEmail(email,legacy?'Set up your Replica Landscapes account':'Reset your Replica Landscapes password',brandEmail({title:legacy?'Welcome to our new website':'Choose a new password',lead:legacy?'We’ve moved from artificialplants.co.uk and replicaplants.co.uk to Replica Landscapes. Choose a password to open your account; your previous orders will be waiting. The link works once, for the next hour.':'Someone (hopefully you) asked to reset the password for your '+(team?'team ':'')+'account. The link works once, for the next hour.',button:'Choose a new password',url:siteUrl()+base+'/reset?t='+t,foot:'Didn’t ask for this? You can ignore this email; your password won’t change.'}));
  await audit(email,'Password reset requested');}
 redirect(base+'/forgot?sent=1');/* same answer whether or not the account exists */
}
export async function completeReset(fd:FormData){
 const team=fd.get('team')==='1';const base=team?'/admin':'/account';const t=str(fd,'t',100);const pw=String(fd.get('password')||'');
 const email=await peekToken('reset',t);if(!email)redirect(base+'/reset?e=expired');
 if(passwordProblem(pw))redirect(base+'/reset?t='+encodeURIComponent(t)+'&e=password');
 let u=await getUser(email!);
 if(!u&&!team){const lc=await legacyCustomer(email!);if(!lc)redirect(base+'/reset?e=expired');
  await kv('HSET','user:'+email,'email',email!,'name',(lc!.f+' '+lc!.l).trim()||email!,'role','customer','created',new Date().toISOString(),'sv','0','phone',lc!.ph||lc!.mob||'','company',lc!.co||'','marketing',lc!.eo?'yes':'no','from','visualsoft');
  await kv('SADD','users:customers',email!);u=await getUser(email!);}
 if(!u)redirect(base+'/reset?e=expired');
 if(u!.tfa==='on'){/* two-step accounts also need a code to reset */
  if(await rateLimited('reset2fa',email!))redirect(base+'/reset?t='+encodeURIComponent(t)+'&e=slow');
  const code=str(fd,'code',20);const step=checkTotp(unseal(u!.tfaSecret)||'',code,Number(u!.tfaStep)||0);const backup=step===null?useBackupCode(u!.tfaBackup,code):null;
  if(step===null&&backup===null)redirect(base+'/reset?t='+encodeURIComponent(t)+'&e=code');
  if(step!==null)await kv('HSET','user:'+email,'tfaStep',String(step));if(backup!==null)await kv('HSET','user:'+email,'tfaBackup',backup);}
 await burnToken('reset',t);
 await kv('HSET','user:'+email,'pw',hashPassword(pw),'sv',String((Number(u!.sv)||0)+1),'verified','yes');
 await audit(email!,'Password reset completed');
 if(team&&STAFF.includes(u!.role)){await startSession('staff',{email:email!,role:u!.role});redirect('/admin?e=reset');}
 await startSession('customer',{email:email!,role:u!.role});redirect('/account?saved=reset');
}

/* ---------- Email verification (unlocks order history from the old websites) ---------- */
export async function resendVerification(){const u=await requireCustomer();if(await rateLimited('verify',u.email))redirect('/account?e=slow');await sendVerification(u.email);redirect('/account?saved=verify');}

/* ---------- Two-step sign-in for the team ---------- */
export async function verifyTwoStep(fd:FormData){
 const jar=await cookies();const t=jar.get(TFA_COOKIE)?.value||'';const email=await peekToken('login2fa',t);if(!email)redirect('/admin/login?e=expired');
 if(await rateLimited('2fa',email!))redirect('/admin/login/verify?e=slow');
 const u=await getUser(email!);if(!u||!STAFF.includes(u.role)||u.tfa!=='on')redirect('/admin/login');
 const code=str(fd,'code',20);const step=checkTotp(unseal(u!.tfaSecret)||'',code,Number(u!.tfaStep)||0);
 let backup:string|null=null;if(step===null)backup=useBackupCode(u!.tfaBackup,code);
 if(step===null&&backup===null){await audit(email!,'Wrong two-step code');redirect('/admin/login/verify?e=code');}
 if(step!==null)await kv('HSET','user:'+email,'tfaStep',String(step));if(backup!==null)await kv('HSET','user:'+email,'tfaBackup',backup);
 await burnToken('login2fa',t);jar.delete({name:TFA_COOKIE,path:'/admin'});
 await kv('HSET','user:'+email,'lastLogin',new Date().toISOString());await startSession('staff',{email:email!,role:u!.role});
 await audit(email!,backup!==null?'Signed in with a backup code':'Signed in (two-step)');redirect(backup!==null?'/admin/security?e=backupused':'/admin');
}
export async function startTwoStepSetup(){const me=await requireStaff();await kv('HSET','user:'+me.email,'tfaPending',seal(newTotpSecret()));redirect('/admin/security?setup=1');}
export async function confirmTwoStepSetup(fd:FormData){const me=await requireStaff();const u=await getUser(me.email);const secret=unseal(u?.tfaPending);if(!secret)redirect('/admin/security');
 const step=checkTotp(secret!,str(fd,'code',10));if(step===null)redirect('/admin/security?setup=1&e=code');
 const {codes,stored}=newBackupCodes();
 await kv('HSET','user:'+me.email,'tfa','on','tfaSecret',seal(secret!),'tfaStep',String(step),'tfaBackup',stored);await kv('HDEL','user:'+me.email,'tfaPending');
 await kv('SET','tfa:show:'+me.email,seal(codes.join(',')),'EX',600);await audit(me.email,'Turned on two-step sign-in');redirect('/admin/security?codes=1');}
export async function newBackupCodesAction(fd:FormData){const me=await requireStaff();const u=await getUser(me.email);if(u?.tfa!=='on')redirect('/admin/security');
 if(checkTotp(unseal(u!.tfaSecret)||'',str(fd,'code',10),0)===null)redirect('/admin/security?e=code');
 const {codes,stored}=newBackupCodes();await kv('HSET','user:'+me.email,'tfaBackup',stored);await kv('SET','tfa:show:'+me.email,seal(codes.join(',')),'EX',600);await audit(me.email,'New backup codes');redirect('/admin/security?codes=1');}
export async function turnOffTwoStep(fd:FormData){const me=await requireStaff();const u=await getUser(me.email);if(u?.tfa!=='on')redirect('/admin/security');
 if(await kv('GET','settings:require2fa')==='yes')redirect('/admin/security?e=required');
 if(checkTotp(unseal(u!.tfaSecret)||'',str(fd,'code',10),0)===null)redirect('/admin/security?e=code');
 await kv('HDEL','user:'+me.email,'tfa','tfaSecret','tfaStep','tfaBackup');await audit(me.email,'Turned off two-step sign-in');redirect('/admin/security?saved=off');}
export async function setRequireTwoStep(fd:FormData){const me=await requireStaff(['owner']);const on=fd.get('on')==='1';
 const u=await getUser(me.email);if(on&&u?.tfa!=='on')redirect('/admin/security?e=selffirst');
 await kv('SET','settings:require2fa',on?'yes':'no');await audit(me.email,(on?'Required':'Stopped requiring')+' two-step sign-in for the team');redirect('/admin/security?saved=1');}
export async function resetTeamTwoStep(fd:FormData){const me=await requireStaff(['owner','admin']);const email=normEmail(str(fd,'email',254));const u=await getUser(email);
 if(!u||!STAFF.includes(u.role)||email===me.email||u.role==='owner'||(u.role==='admin'&&me.role!=='owner'))redirect('/admin/team?e=remove');
 await kv('HDEL','user:'+email,'tfa','tfaSecret','tfaStep','tfaBackup');await kv('HSET','user:'+email,'sv',String((Number(u.sv)||0)+1));
 await audit(me.email,'Reset two-step sign-in',email);redirect('/admin/team?saved=tfareset');}
export async function markVerified(fd:FormData){const me=await requireStaff(['owner','admin']);const email=normEmail(str(fd,'email',254));if(!(await getUser(email)))redirect('/admin/customers?q='+encodeURIComponent(email));
 await kv('HSET','user:'+email,'verified','yes');await audit(me.email,'Confirmed customer email',email);redirect('/admin/customers?q='+encodeURIComponent(email));}
