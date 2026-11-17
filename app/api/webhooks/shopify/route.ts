import {createHmac,timingSafeEqual} from 'node:crypto';
import {after} from 'next/server';
import {kv,kvReady} from '@/lib/kv';
import {notifyTeam,alertEmail,adminLink} from '@/lib/notify';
/* Shopify calls this when an order is placed (topic orders/create). It is signed with the app's client secret;
   unsigned or tampered calls are refused. Each delivery is handled once, then the whole team is emailed. */
export const dynamic='force-dynamic';
const secrets=()=>[process.env.SHOPIFY_WEBHOOK_SECRET,process.env.SHOPIFY_CLIENT_SECRET].filter(Boolean) as string[];
function valid(raw:string,sig:string){const got=Buffer.from(sig||'','base64');if(!got.length)return false;
 return secrets().some(s=>{const want=createHmac('sha256',s).update(raw,'utf8').digest();return want.length===got.length&&timingSafeEqual(want,got);});}
const gbp=(a:string,c:string)=>{try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:c||'GBP'}).format(Number(a));}catch{return a+' '+c;}};
export async function POST(req:Request){
 const raw=await req.text();
 if(!valid(raw,req.headers.get('x-shopify-hmac-sha256')||''))return new Response('unauthorised',{status:401});
 const topic=req.headers.get('x-shopify-topic')||'';const wid=req.headers.get('x-shopify-webhook-id')||req.headers.get('x-shopify-event-id')||'';
 if(topic!=='orders/create')return new Response('ok');
 if(kvReady&&wid){const fresh=await kv<string|null>('SET','webhook:'+wid,'1','NX','EX',259200).catch(()=>'OK');if(fresh!=='OK')return new Response('ok');}
 let o:any;try{o=JSON.parse(raw);}catch{return new Response('ok');}
 const who=[o.customer?.first_name,o.customer?.last_name].filter(Boolean).join(' ')||[o.billing_address?.first_name,o.billing_address?.last_name].filter(Boolean).join(' ')||'A customer';
 const email=o.email||o.contact_email||o.customer?.email||'';
 const items=(o.line_items||[]).map((l:any)=>`${l.quantity} × ${l.title}${l.variant_title?' ('+l.variant_title+')':''} · ${gbp(l.price,o.currency)}`).join('\n');
 const ship=o.shipping_address?[o.shipping_address.city,o.shipping_address.zip,o.shipping_address.country].filter(Boolean).join(', '):'';
 const total=gbp(o.total_price,o.currency);
 const delivery=(o.shipping_lines||[]).map((s:any)=>s.title).filter(Boolean).join(', ');
 const discount=(o.discount_codes||[]).map((d:any)=>d.code).filter(Boolean).join(', ');
 after(()=>notifyTeam('orders',`New order ${o.name||''} · ${total} from ${who}`,alertEmail({title:`New order ${o.name||''}`,lead:`${who} just paid ${total}.`,rows:[['Customer',who],['Email',email],['Phone',o.phone||o.shipping_address?.phone||''],['Total',total],['Delivery',delivery],['Ship to',ship],['Discount code',discount]],body:items,button:'Open the order',url:adminLink('/admin/orders/'+String(o.id||''))}),email||undefined));
 return new Response('ok');}
