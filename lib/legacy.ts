import 'server-only';
import {randomBytes,timingSafeEqual} from 'crypto';
import {kv,kvPipe} from '@/lib/kv';
/* Data carried over from the old Visualsoft websites (artificialplants.co.uk and replicaplants.co.uk).
   legacy:c  hash  email -> customer      legacy:s  hash  email -> newsletter subscriber
   legacy:o:{email} string JSON order list legacy:oc hash email -> number of orders
   legacy:e  hash  id -> enquiry          import:key  one-time key for the import tool (3 hours) */
export type LegacyCustomer={f:string;l:string;co:string;t:string;a1:string;a2:string;town:string;county:string;pc:string;country:string;ph:string;mob:string;eo:boolean;so:boolean;reg:string;last:string;site:string};
export type LegacyItem={n:string;sku:string;q:number;p:number};
export type LegacyOrder={ref:string;date:string;state:string;total:number;ship:number;disc:number;items:LegacyItem[];site:string;pay?:string};
export type LegacySub={f:string;l:string;joined:string;active:boolean;unsub:boolean;bounced:boolean;site:string};
export type LegacyEnquiry={id:string;date:string;name:string;email:string;phone:string;product:string;message:string;type:string;site:string};

const s=(v:unknown,max=300)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const n=(v:unknown)=>{const x=Number(v);return Number.isFinite(x)?Math.round(x*100)/100:0;};
const b=(v:unknown)=>v===true||v==='true'||v==='Yes'||v==='Us'||v==='1';
const em=(v:unknown)=>s(v,254).toLowerCase();
const okEmail=(e:string)=>/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);

export async function newImportKey(){const k=randomBytes(24).toString('hex');await kv('SET','import:key',k,'EX',3*3600);return k;}
export async function revokeImportKey(){await kv('DEL','import:key');}
export async function importKeyTtl(){return Number(await kv('TTL','import:key'))||0;}
export async function checkImportKey(given:string){const k=await kv<string|null>('GET','import:key');if(!k||!given||given.length!==k.length)return false;return timingSafeEqual(Buffer.from(k),Buffer.from(given));}

export async function importBatch(kind:string,items:any[]):Promise<{saved:number;skipped:number}>{
 let saved=0,skipped=0;const cmds:(string|number)[][]=[];
 if(kind==='customers'){const args:(string)[]=[];for(const x of items){const e=em(x.email);if(!okEmail(e)){skipped++;continue;}
   const c:LegacyCustomer={f:s(x.f,80),l:s(x.l,80),co:s(x.co,120),t:s(x.t,20),a1:s(x.a1,160),a2:s(x.a2,160),town:s(x.town,80),county:s(x.county,80),pc:s(x.pc,20),country:s(x.country,60),ph:s(x.ph,40),mob:s(x.mob,40),eo:b(x.eo),so:b(x.so),reg:s(x.reg,30),last:s(x.last,30),site:s(x.site,40)};
   args.push(e,JSON.stringify(c));saved++;}
  if(args.length)cmds.push(['HSET','legacy:c',...args]);}
 else if(kind==='subscribers'){const args:string[]=[];for(const x of items){const e=em(x.email);if(!okEmail(e)){skipped++;continue;}
   const v:LegacySub={f:s(x.f,80),l:s(x.l,80),joined:s(x.joined,30),active:b(x.active),unsub:b(x.unsub),bounced:b(x.bounced),site:s(x.site,40)};args.push(e,JSON.stringify(v));saved++;}
  if(args.length)cmds.push(['HSET','legacy:s',...args]);}
 else if(kind==='enquiries'){const args:string[]=[];for(const x of items){const id=s(x.id,40)||randomBytes(6).toString('hex');
   const v:LegacyEnquiry={id,date:s(x.date,30),name:s(x.name,120),email:em(x.email),phone:s(x.phone,40),product:s(x.product,200),message:s(x.message,4000),type:s(x.type,40),site:s(x.site,40)};args.push(s(x.site,20)+':'+id,JSON.stringify(v));saved++;}
  if(args.length)cmds.push(['HSET','legacy:e',...args]);}
 else if(kind==='orders'){/* items: [{email, orders:[...]}] merged with anything already stored, newest first */
  const groups=items.map(g=>({e:em(g.email),orders:(Array.isArray(g.orders)?g.orders:[]).slice(0,500).map((o:any):LegacyOrder=>({ref:s(o.ref,40),date:s(o.date,30),state:s(o.state,60),total:n(o.total),ship:n(o.ship),disc:n(o.disc),pay:s(o.pay,40),site:s(o.site,40),items:(Array.isArray(o.items)?o.items:[]).slice(0,100).map((i:any)=>({n:s(i.n,200),sku:s(i.sku,60),q:Math.max(0,Math.min(9999,Math.round(n(i.q)))),p:n(i.p)}))})).filter((o:LegacyOrder)=>o.ref)})).filter(g=>{if(okEmail(g.e)&&g.orders.length)return true;skipped++;return false;});
  const existing=groups.length?await kvPipe(groups.map(g=>['GET','legacy:o:'+g.e])):[];
  const oc:string[]=[];
  groups.forEach((g,i)=>{const prev:LegacyOrder[]=existing[i]?JSON.parse(String(existing[i])):[];const m=new Map(prev.map(o=>[o.site+':'+o.ref,o]));g.orders.forEach((o:LegacyOrder)=>m.set(o.site+':'+o.ref,o));
   const all=[...m.values()].sort((a,b)=>b.date.localeCompare(a.date));cmds.push(['SET','legacy:o:'+g.e,JSON.stringify(all)]);oc.push(g.e,String(all.length));saved+=g.orders.length;});
  if(oc.length)cmds.push(['HSET','legacy:oc',...oc]);}
 else throw new Error('Unknown kind');
 for(let i=0;i<cmds.length;i+=200)await kvPipe(cmds.slice(i,i+200));
 return {saved,skipped};
}

export async function legacyCounts(){const [c,s2,e,oc]=await kvPipe([['HLEN','legacy:c'],['HLEN','legacy:s'],['HLEN','legacy:e'],['HLEN','legacy:oc']]);return {customers:Number(c)||0,subscribers:Number(s2)||0,enquiries:Number(e)||0,orderCustomers:Number(oc)||0};}
export async function legacyOrders(email:string):Promise<LegacyOrder[]>{try{const v=await kv<string|null>('GET','legacy:o:'+email.toLowerCase());return v?JSON.parse(v):[];}catch{return [];}}
export async function legacyCustomer(email:string):Promise<LegacyCustomer|null>{try{const v=await kv<string|null>('HGET','legacy:c',email.toLowerCase());return v?JSON.parse(v):null;}catch{return null;}}
export async function legacySub(email:string):Promise<LegacySub|null>{try{const v=await kv<string|null>('HGET','legacy:s',email.toLowerCase());return v?JSON.parse(v):null;}catch{return null;}}
/** Walk a whole hash in pages (for CSV exports). */
export async function* scanHash(key:string){let cur='0';do{const [next,arr]=await kv<[string,string[]]>('HSCAN',key,cur,'COUNT',1000);cur=next;for(let i=0;i<arr.length;i+=2)yield [arr[i],arr[i+1]] as [string,string];}while(cur!=='0');}
export const money=(v:number)=>'£'+v.toFixed(2);
