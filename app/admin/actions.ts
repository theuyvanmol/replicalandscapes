'use server';
import {redirect} from 'next/navigation';
import {createHash} from 'node:crypto';
import {kv} from '@/lib/kv';
import {normEmail,validEmail,hashPassword,checkPassword,passwordProblem,startSession,endSession,getUser,rateLimited,requireStaff,audit,STAFF,type Role} from '@/lib/auth';

// One-time code to create the first owner account. Only works while no staff exist.
const SETUP_HASH='62da9991cbee7d2c04c63697a75a76acb00eb0a11f69ddfd2645b39cf29a4c74';
export async function setupOwner(fd:FormData){
 if(Number(await kv('SCARD','users:staff'))>0)redirect('/admin/login');
 const code=String(fd.get('code')||'').trim().toUpperCase();
 if(createHash('sha256').update(code).digest('hex')!==SETUP_HASH)redirect('/admin/setup?e=code');
 const name=String(fd.get('name')||'').trim().slice(0,80), email=normEmail(String(fd.get('email')||'')), pw=String(fd.get('password')||'');
 if(!name||!validEmail(email))redirect('/admin/setup?e=details');
 if(passwordProblem(pw))redirect('/admin/setup?e=password');
 await kv('HSET','user:'+email,'email',email,'name',name,'role','owner','pw',hashPassword(pw),'created',new Date().toISOString(),'sv','0');
 await kv('SADD','users:staff',email);
 await audit(email,'Created the owner account');
 await startSession('staff',{email,role:'owner'});
 redirect('/admin?welcome=1');
}
export async function staffLogin(fd:FormData){
 const email=normEmail(String(fd.get('email')||'')), pw=String(fd.get('password')||'');
 if(await rateLimited('staff',email))redirect('/admin/login?e=slow');
 const u=await getUser(email);
 if(!u||!u.pw||!STAFF.includes(u.role)||!checkPassword(pw,u.pw)){await audit(email||'unknown','Failed staff sign-in');redirect('/admin/login?e=wrong');}
 await kv('HSET','user:'+email,'lastLogin',new Date().toISOString());
 await startSession('staff',{email,role:u!.role});
 await audit(email,'Signed in');
 redirect('/admin');
}
export async function staffLogout(){await endSession('staff');redirect('/admin/login?e=out');}
export async function addStaff(fd:FormData){
 const me=await requireStaff(['owner','admin']);
 const name=String(fd.get('name')||'').trim().slice(0,80), email=normEmail(String(fd.get('email')||'')), pw=String(fd.get('password')||''), role=String(fd.get('role')||'editor') as Role;
 if(!name||!validEmail(email)||!['admin','editor'].includes(role))redirect('/admin/team?e=details');
 if(role==='admin'&&me.role!=='owner')redirect('/admin/team?e=role');
 if(passwordProblem(pw))redirect('/admin/team?e=password');
 const ex=await getUser(email);if(ex&&STAFF.includes(ex.role))redirect('/admin/team?e=exists');
 await kv('HSET','user:'+email,'email',email,'name',name,'role',role,'pw',hashPassword(pw),'created',new Date().toISOString(),'sv','0');
 await kv('SADD','users:staff',email);await kv('SREM','users:customers',email);
 await audit(me.email,'Added team member',email+' ('+role+')');
 redirect('/admin/team?saved=added');
}
export async function removeStaff(fd:FormData){
 const me=await requireStaff(['owner','admin']);const email=normEmail(String(fd.get('email')||''));
 const u=await getUser(email);if(!u||email===me.email||u.role==='owner'||(u.role==='admin'&&me.role!=='owner'))redirect('/admin/team?e=remove');
 await kv('DEL','user:'+email);await kv('SREM','users:staff',email);
 await audit(me.email,'Removed team member',email);
 redirect('/admin/team?saved=removed');
}
export async function changeStaffPassword(fd:FormData){
 const me=await requireStaff();const full=await getUser(me.email);
 const cur=String(fd.get('current')||''), pw=String(fd.get('password')||'');
 if(!full?.pw||!checkPassword(cur,full.pw))redirect('/admin/settings?e=current');
 if(passwordProblem(pw))redirect('/admin/settings?e=password');
 await kv('HSET','user:'+me.email,'pw',hashPassword(pw),'sv',String((Number(full!.sv)||0)+1));
 await startSession('staff',{email:me.email,role:me.role});
 await audit(me.email,'Changed password');
 redirect('/admin/settings?saved=1');
}
