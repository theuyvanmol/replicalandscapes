import 'server-only';
import {kv,hgetall,kvReady} from '@/lib/kv';
import {sendEmail,emailReady,siteUrl} from '@/lib/email';
/* Team alerts: when a customer sends an enquiry or places an order, everyone on the Team gets an email.
   Each person can switch either alert off on the Team page (stored as user:{email} fields mute_enquiries / mute_orders). */
export type AlertKind='enquiries'|'orders';
const esc=(s:string)=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
export async function teamRecipients(kind:AlertKind){
 if(!kvReady)return [] as string[];
 const emails=(await kv<string[]>('SMEMBERS','users:staff'))||[];
 const people=await Promise.all(emails.map(e=>hgetall('user:'+e)));
 return people.filter(p=>p.email&&p['mute_'+kind]!=='1').map(p=>p.email as string);}
export function alertEmail({title,lead,rows,img,body,button,url}:{title:string;lead:string;rows:[string,string][];img?:string;body?:string;button:string;url:string}){
 return `<!doctype html><html><body style="margin:0;background:#f1efe7;font-family:Helvetica,Arial,sans-serif;color:#22382c"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 14px">
 <table role="presentation" width="100%" style="max-width:560px;background:#faf8f3;border-radius:4px 4px 60px 4px" cellpadding="0" cellspacing="0"><tr><td style="padding:34px 36px 42px">
 <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;color:#22382c99">Replica Landscapes · Team alert</p>
 <h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;line-height:1.15;margin:0 0 10px">${esc(title)}</h1>
 <p style="font-size:15px;line-height:1.6;margin:0 0 22px">${esc(lead)}</p>
 ${img?`<img src="${esc(img)}" alt="" width="160" style="display:block;width:160px;height:auto;border-radius:6px;background:#f1efe7;margin:0 0 18px">`:''}
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;margin:0 0 20px">${rows.filter(r=>r[1]).map(([k,v])=>`<tr><td style="padding:7px 12px 7px 0;color:#22382c99;vertical-align:top;white-space:nowrap;border-bottom:1px solid #22382c18">${esc(k)}</td><td style="padding:7px 0;vertical-align:top;border-bottom:1px solid #22382c18">${esc(v)}</td></tr>`).join('')}</table>
 ${body?`<div style="font-size:14px;line-height:1.65;white-space:pre-line;background:#fff;border:1px solid #22382c1f;border-radius:8px;padding:14px 16px;margin:0 0 24px">${esc(body)}</div>`:''}
 <a href="${esc(url)}" style="display:inline-block;background:#22382c;color:#faf8f3;text-decoration:none;border-radius:99px;padding:13px 24px;font-size:14px">${esc(button)} ↗</a>
 <p style="font-size:11px;line-height:1.6;color:#22382c80;margin:26px 0 0">You get this because you're on the Replica Landscapes team. Switch these emails off in Admin → Team.</p>
 </td></tr></table></td></tr></table></body></html>`;}
/** Email everyone on the team who hasn't muted this kind of alert. Never throws. */
export async function notifyTeam(kind:AlertKind,subject:string,html:string,replyTo?:string){
 try{if(!emailReady)return 0;const to=await teamRecipients(kind);
  const ok=await Promise.all(to.map(t=>sendEmail(t,subject,html,replyTo).catch(()=>false)));
  return ok.filter(Boolean).length;}catch{return 0;}}
export const adminLink=(path:string)=>siteUrl()+path;
