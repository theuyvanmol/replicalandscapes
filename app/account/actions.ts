'use server';
import {redirect} from 'next/navigation';
import {kv} from '@/lib/kv';
import {normEmail,validEmail,hashPassword,checkPassword,passwordProblem,startSession,endSession,getUser,rateLimited,requireCustomer} from '@/lib/auth';

const back=(path:string,e:string,extra='')=>redirect(path+'?e='+e+extra);

export async function register(fd:FormData){
 const name=String(fd.get('name')||'').trim().slice(0,80), email=normEmail(String(fd.get('email')||'')), pw=String(fd.get('password')||'');
 if(String(fd.get('website')||''))back('/account/register','details'); // bots fill hidden fields
 const t=Number(fd.get('t')||0);if(t&&Date.now()-t<2500)back('/account/register','slow'); // submitted inhumanly fast
 if(!name||!validEmail(email))back('/account/register','details');
 if(passwordProblem(pw))back('/account/register','password');
 if(await rateLimited('reg',email))back('/account/register','slow');
 const exists=await getUser(email);if(exists)back('/account/login','exists');
 await kv('HSET','user:'+email,'email',email,'name',name,'role','customer','pw',hashPassword(pw),'created',new Date().toISOString(),'sv','0','marketing',fd.get('marketing')?'yes':'no');
 await kv('SADD','users:customers',email);
 await startSession('customer',{email,role:'customer'});
 redirect('/account?welcome=1');
}
export async function login(fd:FormData){
 const email=normEmail(String(fd.get('email')||'')), pw=String(fd.get('password')||'');
 if(await rateLimited('login',email))back('/account/login','slow');
 const u=await getUser(email);
 if(!u||!u.pw||!checkPassword(pw,u.pw))back('/account/login','wrong');
 await kv('HSET','user:'+email,'lastLogin',new Date().toISOString());
 await startSession('customer',{email,role:u!.role});
 const next=String(fd.get('next')||'');redirect(next.startsWith('/')&&!next.startsWith('//')?next:'/account');
}
export async function logout(){await endSession('customer');redirect('/');}
export async function updateProfile(fd:FormData){
 const u=await requireCustomer();
 const name=String(fd.get('name')||'').trim().slice(0,80), phone=String(fd.get('phone')||'').trim().slice(0,30), company=String(fd.get('company')||'').trim().slice(0,80);
 if(!name)redirect('/account?e=name');
 await kv('HSET','user:'+u.email,'name',name,'phone',phone,'company',company,'marketing',fd.get('marketing')?'yes':'no');
 redirect('/account?saved=1');
}
export async function changePassword(fd:FormData){
 const u=await requireCustomer();const full=await getUser(u.email);
 const cur=String(fd.get('current')||''), pw=String(fd.get('password')||'');
 if(!full?.pw||!checkPassword(cur,full.pw))redirect('/account?e=current');
 if(passwordProblem(pw))redirect('/account?e=password');
 await kv('HSET','user:'+u.email,'pw',hashPassword(pw),'sv',String((Number(full!.sv)||0)+1));
 await startSession('customer',{email:u.email,role:u.role});
 redirect('/account?saved=pw');
}
