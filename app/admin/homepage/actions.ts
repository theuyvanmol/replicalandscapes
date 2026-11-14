'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireStaff,audit} from '@/lib/auth';
import {kv} from '@/lib/kv';
import {pickList} from '@/lib/plant-catalogue';
import {adminReady} from '@/lib/shopify-admin';
import {setBestSellers,setNewArrivals} from '@/lib/shop-admin-data';
export async function saveHomePicks(fd:FormData){const u=await requireStaff(['owner','admin']);const valid=new Set((await pickList()).map(p=>p.handle));
 const read=(k:string)=>{try{const v=JSON.parse(String(fd.get(k)||'[]'));return Array.isArray(v)?v.map(String).filter(h=>valid.has(h)).slice(0,8):[];}catch{return [];}};
 const best=read('best'),arrivals=read('arrivals');
 await kv('SET','home:best',JSON.stringify(best));await kv('SET','home:arrivals',JSON.stringify(arrivals));
 let note='';if(adminReady){try{await setBestSellers(best);await setNewArrivals(arrivals);}catch(e){note=String((e as Error).message).slice(0,200);}}
 await audit(u.email,'homepage.products',`${best.length} best sellers, ${arrivals.length} new arrivals`);revalidatePath('/');const {revalidateTag}=await import('next/cache');revalidateTag('shopify');redirect('/admin/homepage?saved=1'+(note?'&e='+encodeURIComponent(note):''));}
