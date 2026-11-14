'use server';
import {redirect} from 'next/navigation';
import {revalidatePath,revalidateTag} from 'next/cache';
import {requireStaff,audit} from '@/lib/auth';
import {fulfilOrder,setOrderNote,updateAdminProduct,createDiscount,setDiscountActive} from '@/lib/shop-admin-data';
const str=(fd:FormData,k:string,max=500)=>String(fd.get(k)||'').replace(/\r/g,'').trim().slice(0,max);
const err=(e:unknown)=>encodeURIComponent(String((e as Error)?.message||e).slice(0,300));
const gid=(type:string,n:string)=>/^\d{1,20}$/.test(n)?`gid://shopify/${type}/${n}`:'';

export async function fulfilAction(fd:FormData){const u=await requireStaff();const n=str(fd,'order',20);const id=gid('Order',n);if(!id)redirect('/admin/orders');
 try{await fulfilOrder(id,{number:str(fd,'tracking',80),company:str(fd,'carrier',40)||'FedEx',url:str(fd,'trackingUrl',300)},fd.get('notify')==='on');await audit(u.email,'order.fulfil',n);}catch(e){redirect(`/admin/orders/${n}?e=${err(e)}`);}
 redirect(`/admin/orders/${n}?saved=fulfilled`);}
export async function orderNoteAction(fd:FormData){const u=await requireStaff();const n=str(fd,'order',20);const id=gid('Order',n);if(!id)redirect('/admin/orders');
 try{await setOrderNote(id,str(fd,'note',2000));await audit(u.email,'order.note',n);}catch(e){redirect(`/admin/orders/${n}?e=${err(e)}`);}redirect(`/admin/orders/${n}?saved=note`);}
export async function saveProductAction(fd:FormData){const u=await requireStaff(['owner','admin']);const n=str(fd,'product',20);const id=gid('Product',n);if(!id)redirect('/admin/products');
 const paras=str(fd,'description',20000).split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);
 const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const descriptionHtml=paras.map(p=>{const lines=p.split('\n');return lines.every(l=>/^[•\-*]\s/.test(l))?'<ul>'+lines.map(l=>'<li>'+esc(l.replace(/^[•\-*]\s*/,''))+'</li>').join('')+'</ul>':'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>';}).join('');
 const tags=[...new Set([...fd.getAll('tag').map(String),...str(fd,'extraTags',500).split(',').map(t=>t.trim()).filter(Boolean)])].slice(0,40);
 const variants=fd.getAll('variant').map(String).filter(v=>/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(v)).map(v=>{const k=v.split('/').pop();const price=str(fd,'price_'+k,12);const cmp=str(fd,'compare_'+k,12);return {id:v,price:/^\d+(\.\d{1,2})?$/.test(price)?price:'',compareAtPrice:/^\d+(\.\d{1,2})?$/.test(cmp)&&Number(cmp)>Number(price)?cmp:null};}).filter(v=>v.price);
 const status=['ACTIVE','DRAFT','ARCHIVED'].includes(str(fd,'status',10))?str(fd,'status',10):'ACTIVE';
 try{await updateAdminProduct(id,{title:str(fd,'title',255),descriptionHtml,status,tags,productType:str(fd,'productType',80),seoTitle:str(fd,'seoTitle',70),seoDescription:str(fd,'seoDescription',320)},variants);await audit(u.email,'product.update',str(fd,'title',120));}catch(e){redirect(`/admin/products/${n}?e=${err(e)}`);}
 revalidateTag('shopify','max');revalidatePath('/shop');redirect(`/admin/products/${n}?saved=1`);}
export async function createDiscountAction(fd:FormData){const u=await requireStaff(['owner','admin']);
 const auto=str(fd,'how',10)==='auto';const code=auto?'':str(fd,'code',40).toUpperCase().replace(/[^A-Z0-9_-]/g,'');const value=Number(str(fd,'value',8));const kind=str(fd,'kind',10)==='amount'?'amount':'percent';
 if((!auto&&!code)||(auto&&!str(fd,'title',100))||!(value>0)||(kind==='percent'&&value>100))redirect('/admin/discounts?e='+encodeURIComponent(auto?'Give the sale a name and a valid amount.':'Add a code and a valid amount.'));
 const day=(s:string,end=false)=>/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+(end?'T23:59:00':'T00:00:00')).toISOString():null;
 try{await createDiscount({auto,title:str(fd,'title',100)||code,code,kind,value,min:Number(str(fd,'min',8))||null,startsAt:day(str(fd,'start',10))||new Date().toISOString(),endsAt:day(str(fd,'end',10),true),usageLimit:Number(str(fd,'limit',6))||null,oncePerCustomer:fd.get('once')==='on'});await audit(u.email,'discount.create',code||str(fd,'title',100));}catch(e){redirect('/admin/discounts?e='+err(e));}
 redirect('/admin/discounts?saved='+(auto?'auto':code));}
export async function toggleDiscountAction(fd:FormData){const u=await requireStaff(['owner','admin']);const id=str(fd,'id',80);if(!/^gid:\/\/shopify\/Discount(Code|Automatic)Node\/\d+$/.test(id))redirect('/admin/discounts');
 try{await setDiscountActive(id,fd.get('active')==='1');await audit(u.email,'discount.toggle',id);}catch(e){redirect('/admin/discounts?e='+err(e));}redirect('/admin/discounts?saved=1');}
