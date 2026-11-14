import 'server-only';
import {kvPipe} from '@/lib/kv';
/* Privacy-friendly visitor stats kept in our own database: no cookies, no personal data.
   A visitor is a random id held in the browser tab (sessionStorage), so "visitors" means visits. */
const KEEP=400*86400;
export const dayKey=(d=new Date())=>d.toISOString().slice(0,10);
export async function trackEvent(ev:'atc'|'checkout'){const k='a:'+dayKey();try{await kvPipe([['HINCRBY',k,ev,1],['EXPIRE',k,KEEP]]);}catch{}}
export async function trackHit(h:{v:string;p:string;r?:string;cc?:string;mobile:boolean;beat?:boolean;lat?:number;lon?:number;city?:string}){
 const now=Date.now(),day=dayKey(),k='a:'+day;
 const cmds:(string|number)[][]=[['ZADD','live',now,h.v],['ZREMRANGEBYSCORE','live',0,now-5*60e3],['HSET','livepage',h.v,[h.p,h.cc||'',now,h.lat??'',h.lon??'',(h.city||'').replace(/\|/g,' ')].join('|')]];
 if(!h.beat){
  cmds.push(['HINCRBY',k,'pv',1],['PFADD',k+':uv',h.v],['HINCRBY',k+':pages',h.p,1],['HINCRBY',k+':dev',h.mobile?'Mobile':'Desktop',1]);
  const prod=h.p.match(/^\/products\/([a-z0-9-]+)/);if(prod)cmds.push(['HINCRBY',k,'pdp',1],['HINCRBY',k+':prod',prod[1],1]);
  if(h.cc)cmds.push(['HINCRBY',k+':cc',h.cc,1]);
  if(h.r)cmds.push(['HINCRBY',k+':ref',h.r,1]);
  for(const s of ['',':uv',':pages',':dev',':prod',':cc',':ref'])cmds.push(['EXPIRE',k+s,KEEP]);
 }
 await kvPipe(cmds);
}
const top=(a:unknown,n=8):[string,number][]=>{const arr=(a as string[])||[];const m=new Map<string,number>();for(let i=0;i<arr.length;i+=2)m.set(arr[i],Number(arr[i+1]));return [...m].sort((x,y)=>y[1]-x[1]).slice(0,n);};
export async function liveNow(){const now=Date.now();const [,ids,pages]=await kvPipe([['ZREMRANGEBYSCORE','live',0,now-5*60e3],['ZRANGE','live',0,-1],['HGETALL','livepage']]);
 const set=new Set((ids as string[])||[]);const pg=new Map<string,number>(),cc=new Map<string,number>();const pts=new Map<string,{lat:number;lon:number;city:string;cc:string;n:number}>();const arr=(pages as string[])||[];const stale:string[]=[];
 for(let i=0;i<arr.length;i+=2){if(!set.has(arr[i])){stale.push(arr[i]);continue;}const [p,c,,la,lo,ci]=arr[i+1].split('|');pg.set(p,(pg.get(p)||0)+1);if(c)cc.set(c,(cc.get(c)||0)+1);if(la&&lo){const k=(ci||'')+c;const v=pts.get(k)||{lat:Number(la),lon:Number(lo),city:ci||'',cc:c||'',n:0};v.n++;pts.set(k,v);}}
 if(stale.length>50)await kvPipe([['HDEL','livepage',...stale.slice(0,500)]]).catch(()=>{});
 return {count:set.size,pages:[...pg].sort((a,b)=>b[1]-a[1]).slice(0,8),countries:[...cc].sort((a,b)=>b[1]-a[1]).slice(0,6),points:[...pts.values()].slice(0,200)};}
/** Totals and breakdowns for the last `days` days (today included), plus a per-day series. */
export async function stats(days:number){
 const keys=Array.from({length:days},(_,i)=>dayKey(new Date(Date.now()-i*864e5))).reverse();
 const res=await kvPipe([...keys.map(d=>['HGETALL','a:'+d]),['PFCOUNT',...keys.map(d=>'a:'+d+':uv')],...keys.map(d=>['PFCOUNT','a:'+d+':uv'])]);
 const series=keys.map((d,i)=>{const h=top(res[i],50);const g=(n:string)=>h.find(x=>x[0]===n)?.[1]||0;return {d,pv:g('pv'),uv:Number(res[days+1+i])||0,pdp:g('pdp'),atc:g('atc'),checkout:g('checkout')};});
 const sum=(f:'pv'|'pdp'|'atc'|'checkout')=>series.reduce((t,x)=>t+x[f],0);
 const merge=async(suffix:string,n=8)=>{const r=await kvPipe(keys.map(d=>['HGETALL','a:'+d+suffix]));const m=new Map<string,number>();r.forEach(x=>top(x,500).forEach(([k,v])=>m.set(k,(m.get(k)||0)+v)));return [...m].sort((a,b)=>b[1]-a[1]).slice(0,n);};
 const [pages,prods,refs,cc,dev]=await Promise.all([merge(':pages'),merge(':prod'),merge(':ref'),merge(':cc'),merge(':dev')]);
 return {series,visitors:Number(res[days])||0,pv:sum('pv'),pdp:sum('pdp'),atc:sum('atc'),checkout:sum('checkout'),pages,prods,refs,cc,dev};}
