import {trackHit} from '@/lib/analytics';
/* Page-view beacon from the website (see components/Tracker.tsx). Ignores bots, the admin and anything malformed. */
const BOT=/bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|facebookexternalhit|embedly/i;
export async function POST(req:Request){
 const ua=req.headers.get('user-agent')||'';if(BOT.test(ua))return new Response(null,{status:204});
 const o=req.headers.get('origin');if(o&&new URL(o).host!==new URL(req.url).host)return new Response(null,{status:204});
 let b:any={};try{b=JSON.parse(await req.text());}catch{return new Response(null,{status:204});}
 const v=String(b.v||'');const p=String(b.p||'').split('?')[0].slice(0,120);
 if(!/^[a-z0-9]{12,40}$/.test(v)||!p.startsWith('/')||/^\/(admin|api|old-url)/.test(p))return new Response(null,{status:204});
 let r='';try{if(b.r){const h=new URL(String(b.r)).hostname.replace(/^www\./,'');if(h&&h!==new URL(req.url).hostname)r=h.slice(0,60);}}catch{}
 const cc=(req.headers.get('x-vercel-ip-country')||'').slice(0,2).toUpperCase();
 try{await trackHit({v,p,r,cc,mobile:/mobile|android|iphone/i.test(ua),beat:!!b.beat});}catch{}
 return new Response(null,{status:204});}
