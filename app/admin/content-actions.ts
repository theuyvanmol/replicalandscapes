'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireStaff,audit} from '@/lib/auth';
import {savePost,deletePost,getPost,savePromo,deletePromo,getPromo,newId,ukLocalToISO,type Post,type Promo} from '@/lib/content';
const str=(fd:FormData,k:string,max=200)=>String(fd.get(k)||'').trim().slice(0,max);
const safeLink=(s:string)=>/^(\/|https?:\/\/)/.test(s)?s:'';

export async function savePostAction(fd:FormData){
 const u=await requireStaff();
 const id=str(fd,'id',20)||newId();const existing=await getPost(id);
 const title=str(fd,'title',140);if(!title)redirect('/admin/blog/'+(existing?id:'new')+'?e=title');
 const status=fd.get('intent')==='publish'?'published':fd.get('intent')==='unpublish'?'draft':(existing?.status||'draft');
 const post:Post={id,title,slug:str(fd,'slug',90),excerpt:str(fd,'excerpt',320),body:String(fd.get('body')||'').slice(0,60000),cover:safeLink(str(fd,'cover',300)),category:str(fd,'category',40)||'Inspiration',author:str(fd,'author',60)||u.name,status,date:str(fd,'date',10)||new Date().toISOString().slice(0,10),metaDescription:str(fd,'metaDescription',170),updated:''};
 const saved=await savePost(post);
 await audit(u.email,(existing?'Updated':'Created')+' blog post',saved.title+' ('+status+')');
 revalidatePath('/blog');revalidatePath('/blog/'+saved.slug);revalidatePath('/');
 redirect('/admin/blog/'+id+'?saved='+(fd.get('intent')||'1'));
}
export async function deletePostAction(fd:FormData){
 const u=await requireStaff();const id=str(fd,'id',20);
 if(fd.get('confirm')!=='yes')redirect('/admin/blog/'+id+'?e=confirm');
 const p=await getPost(id);await deletePost(id);await audit(u.email,'Deleted blog post',p?.title||id);
 revalidatePath('/blog');redirect('/admin/blog?saved=deleted');
}
export async function savePromoAction(fd:FormData){
 const u=await requireStaff();
 const id=str(fd,'id',20)||newId();const existing=await getPromo(id);
 const title=str(fd,'title',120), start=ukLocalToISO(str(fd,'start',16)), end=ukLocalToISO(str(fd,'end',16));
 if(!title||!start||!end)redirect('/admin/promotions/'+(existing?id:'new')+'?e=required');
 if(new Date(end)<=new Date(start))redirect('/admin/promotions/'+(existing?id:'new')+'?e=dates');
 const theme=(['forest','midnight','terracotta','sage'].includes(str(fd,'theme',12))?str(fd,'theme',12):'forest') as Promo['theme'];
 const promo:Promo={id,kind:fd.get('kind')==='event'?'event':'promotion',eyebrow:str(fd,'eyebrow',40),title,text:str(fd,'text',260),badge:str(fd,'badge',16),code:str(fd,'code',30).toUpperCase(),ctaLabel:str(fd,'ctaLabel',40),ctaLink:safeLink(str(fd,'ctaLink',300)),start,end,showEarly:fd.get('showEarly')==='on',active:fd.get('active')==='on',theme,image:safeLink(str(fd,'image',300)),ticker:str(fd,'ticker',240),updated:''};
 await savePromo(promo);await audit(u.email,(existing?'Updated':'Added')+' '+promo.kind,promo.title);
 revalidatePath('/');redirect('/admin/promotions?saved=1');
}
export async function deletePromoAction(fd:FormData){
 const u=await requireStaff();const id=str(fd,'id',20);
 if(fd.get('confirm')!=='yes')redirect('/admin/promotions/'+id+'?e=confirm');
 const p=await getPromo(id);await deletePromo(id);await audit(u.email,'Removed '+(p?.kind||'promotion'),p?.title||id);
 revalidatePath('/');redirect('/admin/promotions?saved=deleted');
}
export async function togglePromoAction(fd:FormData){
 const u=await requireStaff();const p=await getPromo(str(fd,'id',20));if(!p)redirect('/admin/promotions');
 await savePromo({...p,active:!p.active});await audit(u.email,(p.active?'Paused ':'Switched on ')+p.kind,p.title);
 revalidatePath('/');redirect('/admin/promotions?saved=1');
}
