import 'server-only';
import {randomBytes} from 'node:crypto';
import {kv,kvReady} from '@/lib/kv';

export type Post={id:string;slug:string;title:string;excerpt:string;body:string;cover:string;category:string;author:string;status:'draft'|'published';date:string;metaDescription:string;updated:string};
export type Promo={id:string;kind:'promotion'|'event';eyebrow:string;title:string;text:string;badge:string;code:string;ctaLabel:string;ctaLink:string;start:string;end:string;showEarly:boolean;active:boolean;theme:'forest'|'midnight'|'terracotta'|'sage';image:string;ticker:string;updated:string};

export const newId=()=>randomBytes(6).toString('hex');
export const slugify=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'post';
const parse=<T,>(s:unknown):T|null=>{try{return typeof s==='string'?JSON.parse(s) as T:null;}catch{return null;}};

/* ---------- Blog ---------- */
export async function listPosts(opts:{drafts?:boolean}={}):Promise<Post[]>{
 if(!kvReady)return [];
 const ids=(await kv<string[]>('ZREVRANGE','posts',0,499))||[];
 if(!ids.length)return [];
 const raw=(await kv<(string|null)[]>('MGET',...ids.map(i=>'post:'+i)))||[];
 return raw.map(r=>parse<Post>(r)).filter((p):p is Post=>!!p&&(opts.drafts||(p.status==='published'&&new Date(p.date)<=new Date())));
}
export async function getPost(id:string){return kvReady?parse<Post>(await kv('GET','post:'+id)):null;}
export async function getPostBySlug(slug:string){if(!kvReady)return null;const id=await kv<string|null>('HGET','post-slugs',slug);return id?getPost(id):null;}
export async function savePost(p:Post){
 const old=await getPost(p.id);
 let slug=slugify(p.slug||p.title);const taken=await kv<string|null>('HGET','post-slugs',slug);
 if(taken&&taken!==p.id)slug=slug+'-'+p.id.slice(0,4);
 if(old&&old.slug!==slug)await kv('HDEL','post-slugs',old.slug);
 const post={...p,slug,updated:new Date().toISOString()};
 await kv('SET','post:'+p.id,JSON.stringify(post));
 await kv('ZADD','posts',new Date(post.date).getTime()||Date.now(),p.id);
 await kv('HSET','post-slugs',slug,p.id);
 return post;
}
export async function deletePost(id:string){const p=await getPost(id);if(p)await kv('HDEL','post-slugs',p.slug);await kv('DEL','post:'+id);await kv('ZREM','posts',id);}

/* ---------- Promotions & events ---------- */
export async function listPromos():Promise<Promo[]>{
 if(!kvReady)return [];
 const ids=(await kv<string[]>('SMEMBERS','promos'))||[];
 if(!ids.length)return [];
 const raw=(await kv<(string|null)[]>('MGET',...ids.map(i=>'promo:'+i)))||[];
 return raw.map(r=>parse<Promo>(r)).filter((p):p is Promo=>!!p).sort((a,b)=>a.start.localeCompare(b.start));
}
export function promoState(p:Promo,now=new Date()):'off'|'live'|'upcoming'|'scheduled'|'ended'{
 if(!p.active)return 'off';
 const s=new Date(p.start),e=new Date(p.end);
 if(p.end&&now>e)return 'ended';
 if(p.start&&now<s)return p.showEarly?'upcoming':'scheduled';
 return 'live';
}
export async function homepagePromos(){return (await listPromos()).filter(p=>['live','upcoming'].includes(promoState(p))).sort((a,b)=>(promoState(a)==='live'?0:1)-(promoState(b)==='live'?0:1)||a.start.localeCompare(b.start)).slice(0,5);}
export async function getPromo(id:string){return kvReady?parse<Promo>(await kv('GET','promo:'+id)):null;}
export async function savePromo(p:Promo){await kv('SET','promo:'+p.id,JSON.stringify({...p,updated:new Date().toISOString()}));await kv('SADD','promos',p.id);}
export async function deletePromo(id:string){await kv('DEL','promo:'+id);await kv('SREM','promos',id);}

/* ---------- Uploaded images (stored compressed in the database) ---------- */
export async function saveMedia(type:string,b64:string,name:string){const id=newId();await kv('SET','media:'+id,JSON.stringify({type,b64,name,at:Date.now()}));await kv('ZADD','media',Date.now(),id);return '/api/media/'+id;}
export async function getMedia(id:string){return kvReady?parse<{type:string;b64:string}>(await kv('GET','media:'+id)):null;}

/* Dates in the promotions editor are UK time (Europe/London), whatever the editor's own time zone. */
const ukOffsetH=(d:Date)=>{const n=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',timeZoneName:'shortOffset'}).formatToParts(d).find(p=>p.type==='timeZoneName')?.value||'GMT';const m=/GMT([+-]\d+)?/.exec(n);return m&&m[1]?Number(m[1]):0;};
export function ukLocalToISO(local:string){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))return '';const asUtc=new Date(local+':00Z');return new Date(asUtc.getTime()-ukOffsetH(asUtc)*36e5).toISOString();}
export function isoToUkLocal(iso:string){const d=new Date(iso);if(isNaN(+d))return '';const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
export const ukFormat=(iso:string,o:Intl.DateTimeFormatOptions={weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})=>new Date(iso).toLocaleString('en-GB',{timeZone:'Europe/London',...o});
