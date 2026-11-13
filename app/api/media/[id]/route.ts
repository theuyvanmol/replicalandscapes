import {getMedia} from '@/lib/content';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[a-f0-9]{12}$/.test(id))return new Response('Not found',{status:404});
 const m=await getMedia(id);if(!m)return new Response('Not found',{status:404});
 return new Response(Buffer.from(m.b64,'base64'),{headers:{'Content-Type':m.type,'Cache-Control':'public, max-age=31536000, immutable'}});
}
