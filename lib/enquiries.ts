import 'server-only';
import {kv,kvReady} from '@/lib/kv';
export type Enquiry={id:string;at:string;name:string;email:string;phone:string;topic:string;message:string;page:string;read?:boolean};
export const TOPICS=['General question','Product advice','Bespoke installation','Trade & commercial','An existing order','Leaf Clean maintenance','Gift cards'];
export async function addEnquiry(e:Enquiry){await kv('SET','enquiry:'+e.id,JSON.stringify(e));await kv('ZADD','enquiries',Date.parse(e.at),e.id);}
export async function listEnquiries(n=200):Promise<Enquiry[]>{if(!kvReady)return [];const ids=(await kv<string[]>('ZREVRANGE','enquiries',0,n-1))||[];if(!ids.length)return [];
 const raw=(await kv<(string|null)[]>('MGET',...ids.map(i=>'enquiry:'+i)))||[];return raw.flatMap(r=>{try{return r?[JSON.parse(r) as Enquiry]:[];}catch{return [];}});}
export async function markEnquiry(id:string,read:boolean){const r=await kv<string|null>('GET','enquiry:'+id);if(!r)return;await kv('SET','enquiry:'+id,JSON.stringify({...JSON.parse(r),read}));}
export async function deleteEnquiry(id:string){await kv('DEL','enquiry:'+id);await kv('ZREM','enquiries',id);}
