'use server';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import {randomBytes} from 'node:crypto';
import {kvReady} from '@/lib/kv';
import {rateLimited} from '@/lib/auth';
import {addEnquiry,TOPICS} from '@/lib/enquiries';
const str=(fd:FormData,k:string,max:number)=>String(fd.get(k)||'').replace(/\r/g,'').trim().slice(0,max);
export async function sendEnquiry(fd:FormData){
 if(str(fd,'website',200))redirect('/contact?sent=1#form'); // spam trap
 const name=str(fd,'name',80),email=str(fd,'email',120).toLowerCase(),phone=str(fd,'phone',30),message=str(fd,'message',4000);let topic=str(fd,'topic',40);
 if(!TOPICS.includes(topic))topic='General question';
 const back=(e:string)=>redirect(`/contact?e=${e}&topic=${encodeURIComponent(topic)}#form`);
 if(!name||!message)back('required');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))back('email');
 if(!kvReady)back('offline');
 const ip=((await headers()).get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';
 if(await rateLimited('contact',ip))back('busy');
 await addEnquiry({id:randomBytes(6).toString('hex'),at:new Date().toISOString(),name,email,phone,topic,message,page:str(fd,'from',120)});
 redirect('/contact?sent=1#form');
}
