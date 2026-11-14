'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireStaff,audit} from '@/lib/auth';
import {kv} from '@/lib/kv';
import {pickList} from '@/lib/plant-catalogue';
export async function saveHomePicks(fd:FormData){const u=await requireStaff(['owner','admin']);const valid=new Set((await pickList()).map(p=>p.handle));
 const read=(k:string)=>{try{const v=JSON.parse(String(fd.get(k)||'[]'));return Array.isArray(v)?v.map(String).filter(h=>valid.has(h)).slice(0,8):[];}catch{return [];}};
 const best=read('best'),arrivals=read('arrivals');
 await kv('SET','home:best',JSON.stringify(best));await kv('SET','home:arrivals',JSON.stringify(arrivals));
 await audit(u.email,'homepage.products',`${best.length} best sellers, ${arrivals.length} new arrivals`);revalidatePath('/');redirect('/admin/homepage?saved=1');}
