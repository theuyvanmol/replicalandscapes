import 'server-only';
import {createHmac,randomBytes} from 'node:crypto';
import {kv,kvPipe} from '@/lib/kv';
import {scanHash} from '@/lib/legacy';
import {siteUrl} from '@/lib/email';
import {products} from '@/lib/shopify';
/* Marketing email studio: campaigns are built from blocks, rendered to email-safe HTML,
   and sent through Resend only to people who agreed to marketing. Every email has a one-click unsubscribe. */
export type Block=
 {t:'hero';img:string;title:string;text:string}|{t:'heading';text:string}|{t:'text';text:string}|{t:'button';label:string;url:string}
 |{t:'image';img:string;alt:string;url:string}|{t:'products';handles:string[]}|{t:'offer';code:string;text:string}|{t:'divider'};
export type Campaign={id:string;name:string;subject:string;preheader:string;blocks:Block[];status:'draft'|'sending'|'sent';created:string;updated:string;sentAt?:string;total?:number;sent?:number;failed?:number;by?:string};
const K=(id:string)=>'mail:c:'+id;
export async function listCampaigns():Promise<Campaign[]>{const ids=(await kv<string[]>('LRANGE','mail:list',0,99))||[];if(!ids.length)return [];const r=await kvPipe(ids.map(i=>['GET',K(i)]));return r.filter(Boolean).map(x=>JSON.parse(String(x)));}
export async function getCampaign(id:string):Promise<Campaign|null>{if(!/^[a-z0-9]{6,20}$/.test(id))return null;const v=await kv<string|null>('GET',K(id));return v?JSON.parse(v):null;}
export async function saveCampaign(c:Campaign){c.updated=new Date().toISOString();await kv('SET',K(c.id),JSON.stringify(c));}
export async function newCampaign(by:string,from?:Campaign){const id=randomBytes(6).toString('hex');const now=new Date().toISOString();
 const c:Campaign=from?{...from,id,name:from.name+' (copy)',status:'draft',created:now,updated:now,sentAt:undefined,total:undefined,sent:undefined,failed:undefined,by}
 :{id,name:'New email',subject:'',preheader:'',status:'draft',created:now,updated:now,by,blocks:[
  {t:'hero',img:'/assets/olive-scene.webp',title:'Lasting greenery, beautifully made',text:'Lifelike trees and plants that stay perfect all year.'},
  {t:'text',text:'Write your message here. Keep it short and friendly.'},{t:'button',label:'Shop the collection',url:'/shop'}]};
 await kv('SET',K(id),JSON.stringify(c));await kv('LPUSH','mail:list',id);return c;}
export async function deleteCampaign(id:string){await kv('DEL',K(id),'mail:q:'+id);await kv('LREM','mail:list',0,id);}

/* ---------- Who can receive marketing ---------- */
export async function audience():Promise<string[]>{
 const out=new Set<string>();const unsub=new Set((await kv<string[]>('SMEMBERS','mail:unsub'))||[]);
 for await(const [e,v] of scanHash('legacy:s')){const s=JSON.parse(v);if(s.active&&!s.unsub&&!s.bounced)out.add(e);}
 for await(const [e,v] of scanHash('legacy:c')){if(JSON.parse(v).eo)out.add(e);}
 const accts=(await kv<string[]>('SMEMBERS','users:customers'))||[];
 if(accts.length){const r=await kvPipe(accts.map(e=>['HGET','user:'+e,'marketing']));accts.forEach((e,i)=>{if(r[i]==='yes')out.add(e);else if(r[i]==='no')out.delete(e);});}
 for(const e of unsub)out.delete(e);return [...out].filter(e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));}

/* ---------- Unsubscribe ---------- */
const ukey=()=>'rl-unsub:'+(process.env.SESSION_SECRET||process.env.KV_REST_API_TOKEN||'');
export const unsubSig=(email:string)=>createHmac('sha256',ukey()).update(email).digest('base64url').slice(0,22);
export const unsubUrl=(email:string)=>siteUrl()+'/unsubscribe?e='+Buffer.from(email).toString('base64url')+'&s='+unsubSig(email);
export function readUnsub(e:string,s:string){try{const email=Buffer.from(e,'base64url').toString('utf8');return unsubSig(email)===s?email:null;}catch{return null;}}
export async function unsubscribe(email:string){await kv('SADD','mail:unsub',email);const u=await kv<string|null>('HGET','user:'+email,'email');if(u)await kv('HSET','user:'+email,'marketing','no');
 const s=await kv<string|null>('HGET','legacy:s',email);if(s){const v=JSON.parse(s);v.unsub=true;await kv('HSET','legacy:s',email,JSON.stringify(v));}}

/* ---------- Rendering (table layout and inline styles, so it looks right in Gmail and Outlook) ---------- */
const esc=(s:string)=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
const abs=(u:string)=>!u?'':/^https?:\/\//.test(u)?u:siteUrl()+(u.startsWith('/')?'':'/')+u;
const shopImg=(u:string,w:number)=>/cdn\.shopify\.com/.test(u)?u+(u.includes('?')?'&':'?')+'width='+w:abs(u);
const para=(t:string)=>esc(t).split(/\n{2,}/).map(p=>`<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#22382c">${p.replace(/\n/g,'<br>')}</p>`).join('');
const F="font-family:Helvetica,Arial,sans-serif",S="font-family:Georgia,'Times New Roman',serif";
export async function renderCampaign(c:Campaign,to='{{email}}'){
 const needProducts=c.blocks.some(b=>b.t==='products');const all=needProducts?await products():[];
 const utm=(u:string)=>{const a=abs(u);if(!a.startsWith(siteUrl()))return a;return a+(a.includes('?')?'&':'?')+'utm_source=email&utm_medium=email&utm_campaign='+encodeURIComponent(c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'));};
 const rows=c.blocks.map(b=>{switch(b.t){
  case 'hero':return `<tr><td style="padding:0">${b.img?`<img src="${esc(abs(b.img))}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border-radius:0 0 90px 0">`:''}</td></tr><tr><td style="padding:34px 40px 8px"><h1 style="${S};font-weight:400;font-size:34px;line-height:1.12;margin:0 0 12px;color:#22382c">${esc(b.title)}</h1>${b.text?`<p style="${F};margin:0;font-size:17px;line-height:1.6;color:#22382cb3">${esc(b.text)}</p>`:''}</td></tr>`;
  case 'heading':return `<tr><td style="padding:26px 40px 4px"><h2 style="${S};font-weight:400;font-size:26px;line-height:1.2;margin:0;color:#22382c">${esc(b.text)}</h2></td></tr>`;
  case 'text':return `<tr><td style="padding:14px 40px 2px;${F}">${para(b.text)}</td></tr>`;
  case 'button':return `<tr><td style="padding:14px 40px 18px"><a href="${esc(utm(b.url))}" style="${F};display:inline-block;background:#22382c;color:#faf8f3;text-decoration:none;border-radius:99px;padding:15px 28px;font-size:15px">${esc(b.label)} &#8599;</a></td></tr>`;
  case 'image':{const img=`<img src="${esc(abs(b.img))}" width="520" alt="${esc(b.alt)}" style="display:block;width:100%;height:auto;border-radius:4px 4px 70px 4px">`;return b.img?`<tr><td style="padding:16px 40px">${b.url?`<a href="${esc(utm(b.url))}">${img}</a>`:img}</td></tr>`:'';}
  case 'products':{const ps=b.handles.map(h=>all.find(p=>p.handle===h)).filter(Boolean) as any[];if(!ps.length)return '';
   const cells=ps.slice(0,4).map(p=>`<td width="50%" valign="top" style="padding:8px"><a href="${esc(utm('/products/'+p.handle))}" style="text-decoration:none;color:#22382c"><img src="${esc(shopImg(p.images[0]?.url||'',520))}" width="252" alt="${esc(p.title)}" style="display:block;width:100%;height:auto;border-radius:4px;background:#ebe8dd"><p style="${S};font-size:17px;line-height:1.25;margin:10px 0 4px">${esc(p.title)}</p><p style="${F};font-size:14px;margin:0;color:#22382cb3">${p.price?'From £'+Number(p.price).toFixed(2):''}</p></a></td>`);
   const trs=[];for(let i=0;i<cells.length;i+=2)trs.push(`<tr>${cells[i]}${cells[i+1]||'<td width="50%"></td>'}</tr>`);
   return `<tr><td style="padding:10px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${trs.join('')}</table></td></tr>`;}
  case 'offer':return `<tr><td style="padding:18px 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#22382c;border-radius:4px 4px 50px 4px"><tr><td style="padding:24px 28px;${F};color:#faf8f3"><p style="margin:0 0 8px;font-size:15px;line-height:1.5">${esc(b.text)}</p><p style="margin:0;font-size:13px;letter-spacing:.12em">USE CODE <b style="font-family:Courier,monospace;font-size:20px;letter-spacing:.14em;background:#faf8f31f;padding:4px 10px;border-radius:6px">${esc(b.code)}</b></p></td></tr></table></td></tr>`;
  case 'divider':return `<tr><td style="padding:14px 40px"><div style="border-top:1px solid #22382c22;height:1px;line-height:1px">&nbsp;</div></td></tr>`;}}).join('');
 const un=to==='{{email}}'?'#':to==='__UNSUB__'?'__UNSUB__':unsubUrl(to);
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><title>${esc(c.subject)}</title></head><body style="margin:0;padding:0;background:#f1efe7">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe7"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#faf8f3;border-radius:4px 4px 90px 4px;overflow:hidden">
<tr><td align="center" style="padding:26px 40px 22px"><a href="${esc(utm('/'))}"><img src="${esc(siteUrl())}/assets/replica-landscapes-heritage.webp" width="210" alt="Replica Landscapes" style="display:block;width:210px;height:auto"></a></td></tr>
${rows}
<tr><td style="padding:34px 40px 46px;${F};font-size:12px;line-height:1.6;color:#22382c99">Replica Landscapes · Office &amp; Reception Planters Ltd · Ash Tree Farm, Heddon-on-the-Wall, Newcastle upon Tyne NE15 0HE · 01661 871 481<br>You’re receiving this because you signed up for news and offers from Replica Landscapes (formerly The Artificial Plants Shop / Replica Plants).<br><a href="${esc(un)}" style="color:#22382c">Unsubscribe</a> · <a href="${esc(siteUrl())}/privacy-policy" style="color:#22382c">Privacy</a></td></tr>
</table></td></tr></table></body></html>`;}

/* ---------- Sending (Resend batch API, 100 per request) ---------- */
export async function sendBatch(c:Campaign,emails:string[]){
 const from=process.env.EMAIL_FROM||'Replica Landscapes <onboarding@resend.dev>';
 const tpl=await renderCampaign(c,'__UNSUB__');
 const body=emails.map(to=>({from,to:[to],subject:c.subject,html:tpl.replace('__UNSUB__',unsubUrl(to).replace(/&/g,'&amp;')),headers:{'List-Unsubscribe':`<${unsubUrl(to).replace('/unsubscribe?','/api/unsubscribe?')}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}));
 const r=await fetch('https://api.resend.com/emails/batch',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'content-type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok){const t=await r.text().catch(()=>'');throw new Error('Resend '+r.status+': '+t.slice(0,200));}
 return emails.length;}
