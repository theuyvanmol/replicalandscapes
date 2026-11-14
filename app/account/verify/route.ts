import {burnToken} from '@/lib/security';import {kv} from '@/lib/kv';import {siteUrl} from '@/lib/email';
export async function GET(req:Request){const t=new URL(req.url).searchParams.get('t')||'';const email=await burnToken('verify',t);
 if(email)await kv('HSET','user:'+email,'verified','yes');return Response.redirect(siteUrl()+'/account?saved='+(email?'verified':'verifyfail'),303);}
