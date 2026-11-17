import {revalidateTag} from 'next/cache';
import {currentStaff,audit} from '@/lib/auth';import {adminReady} from '@/lib/shopify-admin';
import {productMedia,addProductImage,deleteProductImage,reorderProductImages,setProductImageAlt} from '@/lib/shop-admin-data';
/* Product photos (team owners/admins only): list, upload, delete, reorder, alt text. Changes go straight to Shopify. */
const ok=async(req:Request)=>{const u=await currentStaff();if(!u||!['owner','admin'].includes(u.role))return null;const o=req.headers.get('origin');if(o&&new URL(o).host!==new URL(req.url).host)return null;return u;};
const gid=(id:string)=>/^\d{1,20}$/.test(id)?'gid://shopify/Product/'+id:null;
const mid=(m:unknown)=>typeof m==='string'&&/^gid:\/\/shopify\/MediaImage\/\d+$/.test(m)?m:null;
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const u=await ok(req);const id=gid((await params).id);if(!u||!id||!adminReady)return Response.json({error:'Not allowed'},{status:403});
 return Response.json({media:await productMedia(id)},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const u=await ok(req);const id=gid((await params).id);if(!u||!id||!adminReady)return Response.json({error:'Please sign in again.'},{status:403});
 const b=await req.json().catch(()=>({}));
 try{
  if(b.op==='add'){const m=String(b.data||'').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);if(!m)return Response.json({error:'That file isn’t a supported image.'},{status:400});
   const bytes=Buffer.from(m[2],'base64');if(bytes.length>4_000_000)return Response.json({error:'Photo too large.'},{status:413});
   const name=String(b.name||'photo').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/\.[a-z]+$/i,'').slice(0,60)+(m[1]==='image/png'?'.png':m[1]==='image/webp'?'.webp':'.jpg');
   await addProductImage(id,bytes,m[1],name,String(b.alt||'').slice(0,250));await audit(u.email,'Added product photo',id.split('/').pop());}
  else if(b.op==='delete'){const m=mid(b.media);if(!m)return Response.json({error:'Unknown photo'},{status:400});await deleteProductImage(id,m);await audit(u.email,'Removed product photo',id.split('/').pop());}
  else if(b.op==='order'){const order=(Array.isArray(b.order)?b.order:[]).map(mid).filter(Boolean) as string[];if(!order.length)return Response.json({error:'Nothing to reorder'},{status:400});await reorderProductImages(id,order.slice(0,50));}
  else if(b.op==='alt'){const m=mid(b.media);if(!m)return Response.json({error:'Unknown photo'},{status:400});await setProductImageAlt(m,String(b.alt||'').slice(0,250));}
  else return Response.json({error:'Unknown action'},{status:400});
 }catch(e){return Response.json({error:(e as Error).message||'Shopify didn’t accept that change.'},{status:502});}
 revalidateTag('shopify','max');return Response.json({ok:true});}
