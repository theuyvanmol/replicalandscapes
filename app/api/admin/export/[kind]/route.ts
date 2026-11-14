import {currentStaff,audit} from '@/lib/auth';
import {scanHash,type LegacyCustomer,type LegacySub,type LegacyEnquiry} from '@/lib/legacy';
import {kv} from '@/lib/kv';
/* Owner-only CSV downloads of the data carried over from Visualsoft. */
const COUNTRY:[RegExp,string][]=[[/^UK|United Kingdom|Great Britain|England|Scotland|Wales/i,'GB'],[/Ireland/i,'IE'],[/^USA|United States/i,'US'],[/Canada/i,'CA'],[/Australia/i,'AU'],[/Germany/i,'DE'],[/France/i,'FR'],[/Spain/i,'ES'],[/Netherlands|Holland/i,'NL'],[/Belgium/i,'BE'],[/Denmark/i,'DK'],[/Sweden/i,'SE'],[/Norway/i,'NO'],[/Italy/i,'IT'],[/Switzerland/i,'CH'],[/New Zealand/i,'NZ'],[/Malta/i,'MT'],[/Cyprus/i,'CY'],[/Portugal/i,'PT'],[/Austria/i,'AT'],[/Poland/i,'PL'],[/Isle of Man/i,'IM']];
const cc=(c:string)=>c.match(/Jersey/i)?'JE':c.match(/Guernsey/i)?'GG':(COUNTRY.find(([r])=>r.test(c))||[,''])[1];
const q=(v:unknown)=>{const t=String(v??'');return /[",\n\r]/.test(t)||/^[=+\-@]/.test(t)?'"'+(/^[=+\-@]/.test(t)?"'":'')+t.replace(/"/g,'""')+'"':t;};
const row=(a:unknown[])=>a.map(q).join(',')+'\r\n';
export async function GET(_req:Request,{params}:{params:Promise<{kind:string}>}){
 const u=await currentStaff();if(!u||!['owner','admin'].includes(u.role))return new Response('Not allowed',{status:403});
 const {kind}=await params;let out='';let name='';
 if(kind==='shopify-customers'){name='shopify-customers-import.csv';
  out+=row(['First Name','Last Name','Email','Accepts Email Marketing','Default Address Company','Default Address Address1','Default Address Address2','Default Address City','Default Address Province Code','Default Address Country Code','Default Address Zip','Default Address Phone','Phone','Accepts SMS Marketing','Tags','Note','Tax Exempt']);
  const subs=new Map<string,LegacySub>();for await(const [e,v] of scanHash('legacy:s'))subs.set(e,JSON.parse(v));
  const counts=new Map<string,string>();for await(const [e,v] of scanHash('legacy:oc'))counts.set(e,v);
  const seen=new Set<string>();
  for await(const [e,v] of scanHash('legacy:c')){const c:LegacyCustomer=JSON.parse(v);seen.add(e);const s=subs.get(e);
   const mk=c.eo||(s?.active&&!s.unsub&&!s.bounced)?'yes':'no';const n=counts.get(e);
   out+=row([c.f,c.l,e,mk,c.co,c.a1,c.a2,c.town,'',cc(c.country),c.pc,c.ph||c.mob,'','no',['visualsoft',c.site,n?'past-customer':'registered'].filter(Boolean).join(', '),[c.reg&&'Joined old website '+c.reg.slice(0,10),n&&n+' order(s) on old website',c.last&&'last '+c.last.slice(0,10)].filter(Boolean).join('; '),'no']);}
  for(const [e,s] of subs){if(seen.has(e)||!s.active||s.unsub||s.bounced)continue;out+=row([s.f,s.l,e,'yes','','','','','','','','','','no','visualsoft, newsletter, '+s.site,'Newsletter subscriber since '+s.joined.slice(0,10),'no']);}
 }else if(kind==='enquiries'){name='visualsoft-enquiries-archive.csv';out+=row(['Date','Site','Type','Name','Email','Phone','Product','Message']);
  const all:LegacyEnquiry[]=[];for await(const [,v] of scanHash('legacy:e'))all.push(JSON.parse(v));all.sort((a,b)=>b.date.localeCompare(a.date)).forEach(x=>out+=row([x.date,x.site,x.type,x.name,x.email,x.phone,x.product,x.message]));
 }else if(kind==='orders'){name='visualsoft-order-history.csv';out+=row(['Date','Site','Order','Email','Status','Total','Postage','Discount','Payment','Items']);
  for await(const [e] of scanHash('legacy:oc')){const v=await kv<string|null>('GET','legacy:o:'+e);if(!v)continue;for(const o of JSON.parse(v))out+=row([o.date,o.site,o.ref,e,o.state,o.total,o.ship,o.disc,o.pay||'',o.items.map((i:any)=>i.q+' x '+i.n).join(' | ')]);}
 }else return new Response('Unknown export',{status:404});
 await audit(u.email,'Downloaded export',kind);
 return new Response('﻿'+out,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="'+name+'"','Cache-Control':'private, no-store'}});
}
