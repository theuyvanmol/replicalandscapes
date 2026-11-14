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
 const num=(h:string,max:number)=>{const n=Number(req.headers.get(h));return Number.isFinite(n)&&Math.abs(n)<=max&&req.headers.get(h)?Math.round(n*10)/10:undefined;};/* city-level only */
 let city='';try{city=decodeURIComponent(req.headers.get('x-vercel-ip-city')||'').slice(0,40);}catch{}
 try{await trackHit({v,p,r,cc,mobile:/mobile|android|iphone/i.test(ua),beat:!!b.beat,lat:num('x-vercel-ip-latitude',90),lon:num('x-vercel-ip-longitude',180),city});}catch{}
 return new Response(null,{status:204});}
