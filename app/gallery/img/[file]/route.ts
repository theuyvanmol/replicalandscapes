import {kv,kvReady} from '@/lib/kv';
export async function GET(_:Request,{params}:{params:Promise<{file:string}>}){const {file}=await params;const m=/^([a-z0-9-]{3,120})\.webp$/.exec(file);if(!m||!kvReady)return new Response('Not found',{status:404});
 const b64=await kv<string|null>('GET','gimg:'+m[1]);if(!b64)return new Response('Not found',{status:404});
 return new Response(Buffer.from(b64,'base64'),{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable'}});}
