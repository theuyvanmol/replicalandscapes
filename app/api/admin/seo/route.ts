import {revalidateTag} from 'next/cache';
import {currentStaff,audit} from '@/lib/auth';
import {admin,adminReady,userErrors} from '@/lib/shopify-admin';
import {kv} from '@/lib/kv';
import {rewriteHtml,cleanTitle,seoTitle,seoDescription} from '@/lib/seo-rewrite';
/* Owner-only bulk SEO tool for product copy. op=scan|backup|apply, paged 25 at a time with `after`. */
export const maxDuration=60;
const OLD=/replica[\s-]?plants|artificial\s+plants\s+(?:shop|ltd|limited|company)|(?:at|from|with|by|choose|contact|call)\s+(?:the\s+)?artificial\s+plants|replicaplants|artificialplants\.co|theartificialplantsshop/i;
const Q=`query($a:String){products(first:25,after:$a,sortKey:ID){pageInfo{hasNextPage endCursor} nodes{id handle title productType tags descriptionHtml seo{title description}}}}`;
export async function POST(req:Request){
 const u=await currentStaff();const o=req.headers.get('origin');
 if(!u||u.role!=='owner'||(o&&new URL(o).host!==new URL(req.url).host)||!adminReady)return Response.json({error:'Not allowed'},{status:403});
 const b=await req.json().catch(()=>({}));const d=await admin<any>(Q,{a:b.after||null});const ps=d.products.nodes;const next=d.products.pageInfo.hasNextPage?d.products.pageInfo.endCursor:null;
 if(b.op==='scan'){const hits=ps.flatMap((p:any)=>{const all=[p.title,p.descriptionHtml,p.seo?.title,p.seo?.description].join(' \n ');const m=all.match(new RegExp(OLD.source,'gi'));return m?[{h:p.handle,m:[...new Set(m)].slice(0,4),ctx:(all.replace(/<[^>]+>/g,' ').match(new RegExp('.{0,60}('+OLD.source+').{0,60}','i'))||[''])[0]}]:[];});
  return Response.json({n:ps.length,next,hits,noSeo:ps.filter((p:any)=>!p.seo?.description).length});}
 if(b.op==='backup'){const tag=String(b.tag||'x').replace(/\W/g,'').slice(0,20);for(const p of ps)await kv('HSET','seo-backup:'+tag,p.id,JSON.stringify({t:p.title,d:p.descriptionHtml,s:p.seo}));return Response.json({n:ps.length,next});}
 if(b.op==='apply'){const out:any[]=[];let changed=0;
  for(const p of ps){const tags=(p.tags||[]).map((t:string)=>t.toLowerCase());
   const title=cleanTitle(p.title);const html=rewriteHtml(p.descriptionHtml||'');
   const st=seoTitle(title),sd=seoDescription(title,html,{outdoor:tags.some((t:string)=>/outdoor|uv/.test(t))||/outdoor|uv/i.test(p.title),fire:tags.some((t:string)=>/fire|flame/.test(t))||/flame|fire/i.test(p.title),priceOnRequest:tags.includes('price on request')});
   const diff=title!==p.title||html!==(p.descriptionHtml||'')||st!==p.seo?.title||sd!==p.seo?.description;
   if(out.length<4)out.push({h:p.handle,title:title!==p.title?title:undefined,st,sd,descChanged:html!==(p.descriptionHtml||'')});
   if(diff&&!b.dry){const r=await admin<any>(`mutation($p:ProductUpdateInput!){productUpdate(product:$p){userErrors{field message}}}`,{p:{id:p.id,title,descriptionHtml:html,seo:{title:st,description:sd}}});userErrors(r.productUpdate);changed++;}}
  if(!b.dry&&changed){revalidateTag('shopify','max');if(!b.after)await audit(u.email,'Bulk SEO update of product copy');}
  return Response.json({n:ps.length,next,changed,sample:out});}
 return Response.json({error:'Unknown op'},{status:400});}
