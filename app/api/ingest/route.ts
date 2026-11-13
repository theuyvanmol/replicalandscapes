import {createHash,timingSafeEqual} from 'node:crypto';
import {kv,kvReady} from '@/lib/kv';
/* Temporary: receives optimised gallery photos copied from the old Visualsoft site. Removed after the import. */
const HASH='0572fbbb7a4e1ba7e0150681e3804b03fe31d96918b782d4d5adfbc7c8d25a20';
const ORIGINS=['https://artificialplants.co.uk','https://www.artificialplants.co.uk'];
const cors=(req:Request)=>{const o=req.headers.get('origin')||'';return ORIGINS.includes(o)?{'Access-Control-Allow-Origin':o,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'content-type, x-ingest-key','Vary':'Origin'}:{} as Record<string,string>;};
const ok=(req:Request)=>{const k=req.headers.get('x-ingest-key')||'';const a=createHash('sha256').update(k).digest();const b=Buffer.from(HASH,'hex');return a.length===b.length&&timingSafeEqual(a,b);};
export async function OPTIONS(req:Request){return new Response(null,{status:204,headers:cors(req)});}
export async function POST(req:Request){const h=cors(req);if(!ok(req))return Response.json({error:'no'},{status:401,headers:h});if(!kvReady)return Response.json({error:'storage'},{status:503,headers:h});
 const {slug,type,data}=await req.json().catch(()=>({}));
 if(typeof slug!=='string'||!/^[a-z0-9-]{3,120}$/.test(slug)||type!=='image/webp'||typeof data!=='string'||data.length>1_400_000)return Response.json({error:'bad'},{status:400,headers:h});
 await kv('SET','gimg:'+slug,data);await kv('SADD','gimgs',slug);return Response.json({ok:true,bytes:Math.round(data.length*.75)},{headers:h});}
export async function GET(req:Request){const h=cors(req);if(!ok(req))return Response.json({error:'no'},{status:401,headers:h});const l=(await kv<string[]>('SMEMBERS','gimgs'))||[];return Response.json({count:l.length,list:l.sort()},{headers:h});}
