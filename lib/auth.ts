import 'server-only';
import {scryptSync,randomBytes,timingSafeEqual,createHmac,createHash} from 'node:crypto';
import {cookies,headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {kv,hgetall,kvReady} from '@/lib/kv';

export type Role='customer'|'owner'|'admin'|'editor';
export type User={email:string;name:string;role:Role;created:string;phone?:string;company?:string;lastLogin?:string};
export const STAFF:Role[]=['owner','admin','editor'];
export const CUSTOMER_COOKIE='rl_account', STAFF_COOKIE='rl_admin';
const DAY=86400;

const secret=()=>createHash('sha256').update('rl-session:'+(process.env.SESSION_SECRET||process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||'')).digest();
export const normEmail=(e:string)=>e.trim().toLowerCase();
export const validEmail=(e:string)=>/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);

export function hashPassword(pw:string){const salt=randomBytes(16);const h=scryptSync(pw,salt,64,{N:16384,r:8,p:1});return 'scrypt$'+salt.toString('base64')+'$'+h.toString('base64');}
export function checkPassword(pw:string,stored:string){try{const [,s,h]=stored.split('$');const want=Buffer.from(h,'base64');const got=scryptSync(pw,Buffer.from(s,'base64'),want.length,{N:16384,r:8,p:1});return timingSafeEqual(want,got);}catch{return false;}}
export const passwordProblem=(pw:string)=>pw.length<10?'Use at least 10 characters.':pw.length>200?'That password is too long.':null;

function sign(payload:object){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');const mac=createHmac('sha256',secret()).update(body).digest('base64url');return body+'.'+mac;}
function verify<T>(token?:string):T|null{if(!token)return null;const [body,mac]=token.split('.');if(!body||!mac)return null;const want=createHmac('sha256',secret()).update(body).digest('base64url');if(want.length!==mac.length||!timingSafeEqual(Buffer.from(want),Buffer.from(mac)))return null;try{const p=JSON.parse(Buffer.from(body,'base64url').toString());return p.exp>Date.now()/1000?p as T:null;}catch{return null;}}

type Session={e:string;r:Role;v:number;exp:number};
export async function startSession(kind:'customer'|'staff',u:{email:string;role:Role}){
 const v=Number(await kv('HGET','user:'+u.email,'sv'))||0;
 const days=kind==='staff'?1:30;
 (await cookies()).set(kind==='staff'?STAFF_COOKIE:CUSTOMER_COOKIE,sign({e:u.email,r:u.role,v,exp:Math.floor(Date.now()/1000)+days*DAY}),{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:days*DAY});
}
export async function endSession(kind:'customer'|'staff'){(await cookies()).delete(kind==='staff'?STAFF_COOKIE:CUSTOMER_COOKIE);}

export async function getUser(email:string):Promise<(User&{pw?:string;sv?:string})|null>{const h=await hgetall('user:'+email);return h.email?(h as unknown as User&{pw?:string;sv?:string}):null;}
async function current(kind:'customer'|'staff'){
 if(!kvReady)return null;
 const s=verify<Session>((await cookies()).get(kind==='staff'?STAFF_COOKIE:CUSTOMER_COOKIE)?.value);if(!s)return null;
 const u=await getUser(s.e);if(!u||(Number(u.sv)||0)!==s.v)return null;
 if(kind==='staff'&&!STAFF.includes(u.role))return null;
 const {pw,sv,...safe}=u;void pw;void sv;return safe as User;
}
export const currentCustomer=()=>current('customer');
export const currentStaff=()=>current('staff');
export async function requireStaff(roles:Role[]=STAFF){const u=await currentStaff();if(!u)redirect('/admin/login');if(!roles.includes(u.role))redirect('/admin?e=role');return u;}
export async function requireCustomer(){const u=await currentCustomer();if(!u)redirect('/account/login');return u;}

/** Allow 8 attempts per 15 minutes per IP + email. */
export async function rateLimited(scope:string,email:string){
 const ip=((await headers()).get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';
 const key='rl:'+scope+':'+createHash('sha256').update(ip+'|'+email).digest('hex').slice(0,24);
 const n=Number(await kv('INCR',key));if(n===1)await kv('EXPIRE',key,900);return n>8;
}
export async function audit(by:string,action:string,detail=''){try{await kv('LPUSH','audit',JSON.stringify({at:new Date().toISOString(),by,action,detail}));await kv('LTRIM','audit',0,499);}catch{}}
