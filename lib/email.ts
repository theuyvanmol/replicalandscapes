import 'server-only';
/* Transactional email through Resend (resend.com). Needs RESEND_API_KEY, and EMAIL_FROM once the domain is verified,
   e.g. "Replica Landscapes <hello@replicaplants.co.uk>". Without a key, nothing is sent and callers show a fallback. */
export const emailReady=!!process.env.RESEND_API_KEY;
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
export const siteUrl=()=>(process.env.NEXT_PUBLIC_SITE_URL||'https://replicalandscapes.vercel.app').replace(/\/$/,'');
export function brandEmail({title,lead,button,url,foot}:{title:string;lead:string;button:string;url:string;foot:string}){
 return `<!doctype html><html><body style="margin:0;background:#f1efe7;font-family:Helvetica,Arial,sans-serif;color:#22382c"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
 <table role="presentation" width="100%" style="max-width:520px;background:#faf8f3;border-radius:4px 4px 60px 4px" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 40px 48px">
 <img src="${siteUrl()}/assets/replica-landscapes-heritage.webp" alt="Replica Landscapes" width="220" style="display:block;margin:0 0 32px">
 <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.15;margin:0 0 14px">${esc(title)}</h1>
 <p style="font-size:15px;line-height:1.6;margin:0 0 26px">${esc(lead)}</p>
 <a href="${esc(url)}" style="display:inline-block;background:#22382c;color:#faf8f3;text-decoration:none;border-radius:99px;padding:14px 26px;font-size:14px">${esc(button)} ↗</a>
 <p style="font-size:12px;line-height:1.6;color:#22382c99;margin:28px 0 0">${esc(foot)}</p>
 </td></tr></table><p style="font-size:11px;color:#22382c80;margin:18px 0 0">Replica Landscapes · Ash Tree Farm, Heddon-on-the-Wall, NE15 0HE · 01661 871 481</p></td></tr></table></body></html>`;}
export async function sendEmail(to:string,subject:string,html:string){
 if(!emailReady)return false;
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'content-type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM||'Replica Landscapes <onboarding@resend.dev>',to:[to],subject,html})});
 return r.ok;}
