import 'server-only';
// Upstash Redis over its REST API (connected in Vercel → Storage). No package needed.
const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
export const kvReady=!!(url&&token);
export async function kv<T=unknown>(...cmd:(string|number)[]):Promise<T>{
 if(!kvReady)throw new Error('Storage is not connected');
 const r=await fetch(url!,{method:'POST',headers:{Authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(cmd),cache:'no-store'});
 if(!r.ok)throw new Error('Storage error '+r.status);
 return (await r.json()).result as T;
}
export const hgetall=async(key:string)=>{const a=await kv<string[]|null>('HGETALL',key);const o:Record<string,string>={};if(a)for(let i=0;i<a.length;i+=2)o[a[i]]=a[i+1];return o;};
