import 'server-only';
import {createHmac,createHash,randomBytes,createCipheriv,createDecipheriv,timingSafeEqual} from 'node:crypto';
import {kv} from '@/lib/kv';
import {QRCode,QRErrorCorrectLevel} from '@/lib/vendor/qrcode.js';
/* Two-step sign-in (authenticator app codes, RFC 6238), backup codes, and one-time tokens for
   password reset and email verification. Secrets are stored encrypted with a key derived from SESSION_SECRET. */
const key=()=>createHash('sha256').update('rl-2fa:'+(process.env.SESSION_SECRET||process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||'')).digest();
export function seal(text:string){const iv=randomBytes(12);const c=createCipheriv('aes-256-gcm',key(),iv);const enc=Buffer.concat([c.update(text,'utf8'),c.final()]);return [iv,c.getAuthTag(),enc].map(b=>b.toString('base64url')).join('.');}
export function unseal(box?:string){if(!box)return null;try{const [iv,tag,enc]=box.split('.').map(x=>Buffer.from(x,'base64url'));const d=createDecipheriv('aes-256-gcm',key(),iv);d.setAuthTag(tag);return Buffer.concat([d.update(enc),d.final()]).toString('utf8');}catch{return null;}}
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newTotpSecret(){const b=randomBytes(20);let bits='',out='';for(const x of b)bits+=x.toString(2).padStart(8,'0');for(let i=0;i+5<=bits.length;i+=5)out+=B32[parseInt(bits.slice(i,i+5),2)];return out;}
function b32decode(s:string){let bits='';for(const ch of s.replace(/=+$/,'').toUpperCase()){const v=B32.indexOf(ch);if(v<0)continue;bits+=v.toString(2).padStart(5,'0');}const out=[];for(let i=0;i+8<=bits.length;i+=8)out.push(parseInt(bits.slice(i,i+8),2));return Buffer.from(out);}
function hotp(secret:string,counter:number){const buf=Buffer.alloc(8);buf.writeBigUInt64BE(BigInt(counter));const h=createHmac('sha1',b32decode(secret)).update(buf).digest();const o=h[h.length-1]&15;return String(((h.readUInt32BE(o)&0x7fffffff)%1_000_000)).padStart(6,'0');}
/** Returns the matching time step (to block reuse), or null. Allows one step of clock drift either way. */
export function checkTotp(secret:string,code:string,lastStep=0):number|null{const c=code.replace(/\D/g,'');if(c.length!==6)return null;const now=Math.floor(Date.now()/30000);
 for(const d of [0,-1,1]){const step=now+d;if(step<=lastStep)continue;const want=hotp(secret,step);if(timingSafeEqual(Buffer.from(want),Buffer.from(c)))return step;}return null;}
export const otpauthUrl=(email:string,secret:string)=>'otpauth://totp/'+encodeURIComponent('Replica Landscapes:'+email)+'?secret='+secret+'&issuer=Replica%20Landscapes&algorithm=SHA1&digits=6&period=30';
export function qrSvg(text:string){const q=new QRCode(-1,QRErrorCorrectLevel.M);q.addData(text);q.make();const n=q.getModuleCount(),m=4;let d='';
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c+m} ${r+m}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n+2*m} ${n+2*m}" shape-rendering="crispEdges" role="img" aria-label="QR code for your authenticator app"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#22382c"/></svg>`;}
const h=(s:string)=>createHash('sha256').update(s).digest('hex');
export function newBackupCodes(){const codes=Array.from({length:8},()=>{const x=randomBytes(5).toString('hex').toUpperCase();return x.slice(0,5)+'-'+x.slice(5);});return {codes,stored:JSON.stringify(codes.map(c=>h(c)))};}
export function useBackupCode(stored:string|undefined,code:string):string|null{const list:string[]=stored?JSON.parse(stored):[];const want=h(code.trim().toUpperCase());const i=list.indexOf(want);if(i<0)return null;list.splice(i,1);return JSON.stringify(list);}
/* One-time tokens (only a hash is stored). */
export async function newToken(kind:'reset'|'verify'|'login2fa',email:string,ttl:number){const t=randomBytes(32).toString('base64url');await kv('SET','tok:'+kind+':'+h(t),email,'EX',ttl);return t;}
export async function peekToken(kind:string,t:string){if(!t||t.length>100)return null;return await kv<string|null>('GET','tok:'+kind+':'+h(t));}
export async function burnToken(kind:string,t:string){const e=await peekToken(kind,t);if(e)await kv('DEL','tok:'+kind+':'+h(t));return e;}
