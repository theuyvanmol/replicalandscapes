import {NextResponse} from 'next/server';
// Private keep-list storage. Clicks from the client's link are saved in Upstash Redis
// (Vercel Storage → Upstash). The link's key must match; nothing here is linked from the site.
const KEY='2ca1hj9g0n';
const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const SEED_TASKS:Record<string,string>={d1:'{"done":true,"at":1794441600000}',d2:'{"done":true,"at":1794441600000}',d3:'{"done":true,"at":1794441600000}',d4:'{"done":true,"at":1794448800000}',d5:'{"done":true,"at":1794452400000}',d6:'{"done":true,"at":1794466800000}'};
const SEED_DECISIONS:Record<string,string>={'1':'{"s":"remove","note":"","at":1794474457039}'};
export const dynamic='force-dynamic';
async function redis(cmd:(string|number)[]){const r=await fetch(url!,{method:'POST',headers:{Authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(cmd),cache:'no-store'});if(!r.ok)throw new Error('redis '+r.status);return (await r.json()).result;}
const toMap=(arr:string[]|null)=>{const o:Record<string,unknown>={};if(arr)for(let i=0;i<arr.length;i+=2){try{o[arr[i]]=JSON.parse(arr[i+1]);}catch{}}return o;};
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
function guard(req:Request){return new URL(req.url).searchParams.get('k')===KEY;}
export async function GET(req:Request){
 if(!guard(req))return NextResponse.json({error:'not found'},{status:404,headers});
 if(!url||!token)return NextResponse.json({error:'storage not connected'},{status:503,headers});
 if(!(await redis(['EXISTS','kl:seeded']))){await redis(['HSET','kl:tasks',...Object.entries(SEED_TASKS).flat()]);await redis(['HSET','kl:decisions',...Object.entries(SEED_DECISIONS).flat()]);await redis(['SET','kl:seeded','1']);}
 const [d,t]=await Promise.all([redis(['HGETALL','kl:decisions']),redis(['HGETALL','kl:tasks'])]);
 return NextResponse.json({decisions:toMap(d),tasks:toMap(t)},{headers});
}
export async function POST(req:Request){
 if(!guard(req))return NextResponse.json({error:'not found'},{status:404,headers});
 if(!url||!token)return NextResponse.json({error:'storage not connected'},{status:503,headers});
 let b:{kind?:string;id?:string;value?:Record<string,unknown>|null;by?:string|null};
 try{b=await req.json();}catch{return NextResponse.json({error:'bad request'},{status:400,headers});}
 const id=String(b.id||'');if(!/^[a-z0-9-]{1,20}$/i.test(id)||(b.kind!=='d'&&b.kind!=='t'))return NextResponse.json({error:'bad request'},{status:400,headers});
 const hash=b.kind==='d'?'kl:decisions':'kl:tasks';
 const by=typeof b.by==='string'?b.by.slice(0,60):null;
 if(!b.value){await redis(['HDEL',hash,id]);}
 else{const v=b.kind==='d'?{s:['keep','maybe','remove',''].includes(String(b.value.s))?String(b.value.s):'',note:String(b.value.note||'').slice(0,2000),at:Number(b.value.at)||Date.now(),by}:{done:true,at:Number(b.value.at)||Date.now(),by};
  await redis(['HSET',hash,id,JSON.stringify(v)]);
  await redis(['HSET','kl:log',Date.now()+'-'+id,JSON.stringify({kind:b.kind,id,...v})]);}
 return NextResponse.json({ok:true},{headers});
}
