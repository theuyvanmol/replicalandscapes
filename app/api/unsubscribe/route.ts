import {readUnsub,unsubscribe} from '@/lib/mail';
/* One-click unsubscribe used by Gmail/Apple Mail (RFC 8058). */
export async function POST(req:Request){const q=new URL(req.url).searchParams;const email=readUnsub(q.get('e')||'',q.get('s')||'');if(email)await unsubscribe(email);return new Response(null,{status:email?200:400});}
