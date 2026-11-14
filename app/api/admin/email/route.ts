import {currentStaff,audit} from '@/lib/auth';import {kv} from '@/lib/kv';import {emailReady,sendEmail} from '@/lib/email';
import {getCampaign,saveCampaign,renderCampaign,audience,sendBatch,newCampaign,deleteCampaign,type Campaign,type Block} from '@/lib/mail';
/* Email studio actions (team only). */
const T=new Set(['hero','heading','text','button','image','products','offer','divider']);
const s=(v:unknown,n=2000)=>String(v??'').slice(0,n);
function cleanBlocks(b:unknown):Block[]{return (Array.isArray(b)?b:[]).slice(0,40).filter((x:any)=>T.has(x?.t)).map((x:any)=>({t:x.t,...(x.img!==undefined?{img:s(x.img,500)}:{}),...(x.title!==undefined?{title:s(x.title,200)}:{}),...(x.text!==undefined?{text:s(x.text,5000)}:{}),...(x.label!==undefined?{label:s(x.label,80)}:{}),...(x.url!==undefined?{url:s(x.url,500)}:{}),...(x.alt!==undefined?{alt:s(x.alt,200)}:{}),...(x.code!==undefined?{code:s(x.code,40).toUpperCase()}:{}),...(Array.isArray(x.handles)?{handles:x.handles.slice(0,4).map((h:unknown)=>s(h,120))}:{})})) as Block[];}
export async function POST(req:Request){
 const u=await currentStaff();if(!u||!['owner','admin','editor'].includes(u.role))return Response.json({error:'Please sign in again.'},{status:401});
 const o=req.headers.get('origin');if(o&&new URL(o).host!==new URL(req.url).host)return Response.json({error:'Bad origin'},{status:403});
 const b=await req.json().catch(()=>({}));const op=String(b.op||'');
 if(op==='new'){const from=b.from?await getCampaign(String(b.from)):null;const c=await newCampaign(u.email,from||undefined);return Response.json({id:c.id});}
 const c=await getCampaign(String(b.id||''));if(!c)return Response.json({error:'Email not found.'},{status:404});
 const draft:Campaign=b.campaign&&c.status==='draft'?{...c,name:s(b.campaign.name,120)||'Untitled',subject:s(b.campaign.subject,150),preheader:s(b.campaign.preheader,200),blocks:cleanBlocks(b.campaign.blocks)}:c;
 if(op==='save'){if(c.status!=='draft')return Response.json({error:'Sent emails can’t be edited. Duplicate it instead.'},{status:400});await saveCampaign(draft);return Response.json({ok:true});}
 if(op==='preview'){return Response.json({html:await renderCampaign(draft)});}
 if(op==='count'){const a=await audience();return Response.json({count:a.length,ready:emailReady});}
 if(op==='test'){if(!emailReady)return Response.json({error:'Connect email sending first (RESEND_API_KEY in Vercel).'},{status:400});
  const ok=await sendEmail(u.email,'[Test] '+(draft.subject||draft.name),(await renderCampaign(draft,u.email)));return ok?Response.json({ok:true,to:u.email}):Response.json({error:'The test didn’t send. Check the Resend settings.'},{status:502});}
 if(op==='delete'){if(c.status==='sending')return Response.json({error:'Wait for sending to finish.'},{status:400});await deleteCampaign(c.id);await audit(u.email,'Deleted email',c.name);return Response.json({ok:true});}
 if(op==='start'){if(!['owner','admin'].includes(u.role))return Response.json({error:'Only the owner or an admin can send to customers.'},{status:403});
  if(!emailReady)return Response.json({error:'Connect email sending first.'},{status:400});if(c.status!=='draft')return Response.json({error:'Already sent.'},{status:400});
  if(!draft.subject)return Response.json({error:'Add a subject line first.'},{status:400});
  const list=await audience();if(!list.length)return Response.json({error:'Nobody has agreed to marketing emails yet.'},{status:400});
  await kv('DEL','mail:q:'+c.id);for(let i=0;i<list.length;i+=1000)await kv('RPUSH','mail:q:'+c.id,...list.slice(i,i+1000));
  await saveCampaign({...draft,status:'sending',total:list.length,sent:0,failed:0,sentAt:new Date().toISOString()});await audit(u.email,'Started sending email',draft.name+' to '+list.length);
  return Response.json({ok:true,total:list.length});}
 if(op==='step'){if(c.status!=='sending')return Response.json({done:true,sent:c.sent||0,total:c.total||0});
  const lockOk=await kv('SET','mail:lock:'+c.id,'1','NX','EX',55);if(!lockOk)return Response.json({busy:true,sent:c.sent||0,total:c.total||0});
  let sent=c.sent||0,failed=c.failed||0;
  try{for(let round=0;round<4;round++){const batch=(await kv<string[]>('LPOP','mail:q:'+c.id,100))||[];if(!batch.length)break;try{sent+=await sendBatch(c,batch);}catch{failed+=batch.length;}}}
  finally{await kv('DEL','mail:lock:'+c.id);}
  const left=Number(await kv('LLEN','mail:q:'+c.id))||0;const done=left===0;
  await saveCampaign({...c,sent,failed,status:done?'sent':'sending'});if(done)await audit(u.email,'Finished sending email',c.name+': '+sent+' sent');
  return Response.json({done,sent,failed,total:c.total||0});}
 return Response.json({error:'Unknown action'},{status:400});}
