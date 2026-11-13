import {createHash,timingSafeEqual} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {savePost,getPostBySlug,savePromo,listPromos,newId,type Post,type Promo} from '@/lib/content';
import data from '@/lib/seed-content.json';
/* Temporary: publishes the first three blog posts and the Black Friday promotion once. Removed afterwards. */
const HASH='1f0ea9c6a14b32a8b01406010488b50e1c06022404262d4fdf9eabfec1d22402';
export async function POST(req:Request){const k=req.headers.get('x-seed-key')||'';const a=createHash('sha256').update(k).digest();const b=Buffer.from(HASH,'hex');if(a.length!==b.length||!timingSafeEqual(a,b))return Response.json({error:'no'},{status:401});
 const out:string[]=[];
 for(const p of data.posts){const old=await getPostBySlug(p.slug);const post:Post={id:old?.id||newId(),slug:p.slug,title:p.title,excerpt:p.excerpt,body:p.body,cover:p.cover,category:p.category,author:'Replica Landscapes',status:'published',date:p.date,metaDescription:p.meta,updated:''};await savePost(post);out.push('post '+p.slug);}
 const existing=(await listPromos()).find(x=>x.title===data.promo.title);
 const promo:Promo={...(data.promo as Omit<Promo,'id'|'updated'>),id:existing?.id||newId(),updated:''};await savePromo(promo);out.push('promo '+promo.id);
 revalidatePath('/');revalidatePath('/blog');for(const p of data.posts)revalidatePath('/blog/'+p.slug);
 return Response.json({ok:true,out});}
