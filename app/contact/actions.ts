'use server';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import {after} from 'next/server';
import {notifyTeam,alertEmail,adminLink} from '@/lib/notify';
import {randomBytes} from 'node:crypto';
import {kvReady} from '@/lib/kv';
import {rateLimited} from '@/lib/auth';
import {addEnquiry,TOPICS} from '@/lib/enquiries';import {product as getProduct} from '@/lib/shopify';
const str=(fd:FormData,k:string,max:number)=>String(fd.get(k)||'').replace(/\r/g,'').trim().slice(0,max);
export async function sendEnquiry(fd:FormData){
 if(str(fd,'website',200))redirect('/contact?sent=1#form'); // spam trap
 const name=str(fd,'name',80),email=str(fd,'email',120).toLowerCase(),phone=str(fd,'phone',30),message=str(fd,'message',4000);let topic=str(fd,'topic',40);
 if(!TOPICS.includes(topic))topic='General question';
 const back=(e:string)=>redirect(`/contact?e=${e}&topic=${encodeURIComponent(topic)}${/^[a-z0-9-]+$/.test(str(fd,'product',120))?'&product='+str(fd,'product',120):''}#form`);
 if(!name||!message)back('required');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))back('email');
 if(!kvReady)back('offline');
 const ip=((await headers()).get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';
 if(await rateLimited('contact',ip))back('busy');
 const ph=str(fd,'product',120);const pr=/^[a-z0-9-]+$/.test(ph)?await getProduct(ph).catch(()=>null):null;
 const prod=pr?{handle:pr.handle,title:pr.title,img:pr.images[0]?.url||''}:undefined;
 await addEnquiry({id:randomBytes(6).toString('hex'),at:new Date().toISOString(),name,email,phone,topic,message,page:str(fd,'from',120),...(prod?{product:prod}:{})});
 after(()=>notifyTeam('enquiries',`New enquiry: ${topic}${prod?' · '+prod.title:''} (${name})`,alertEmail({title:'New enquiry from '+name,lead:topic+(prod?' about '+prod.title:'')+'. Reply to this email to answer them directly.',img:prod?.img?prod.img+(prod.img.includes('?')?'&':'?')+'width=320':undefined,rows:[['Name',name],['Email',email],['Phone',phone],['Topic',topic],['Product',prod?.title||''],['Sent from',str(fd,'from',120)]],body:message,button:'Open in Enquiries',url:adminLink('/admin/enquiries')}),email));
 redirect('/contact?sent=1#form');
}
