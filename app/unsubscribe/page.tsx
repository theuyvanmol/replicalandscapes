import AuthLayout from '@/components/AuthLayout';import {readUnsub,unsubscribe} from '@/lib/mail';import {redirect} from 'next/navigation';
export const metadata={title:'Unsubscribe',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
async function confirm(fd:FormData){'use server';const e=String(fd.get('e')||''),s=String(fd.get('s')||'');const email=readUnsub(e,s);if(email)await unsubscribe(email);redirect('/unsubscribe?done='+(email?'1':'0'));}
export default async function Unsub({searchParams}:{searchParams:Promise<{e?:string;s?:string;done?:string}>}){const {e='',s='',done}=await searchParams;const email=done?null:readUnsub(e,s);
 return <AuthLayout eyebrow="Email preferences" title={done==='1'?<>You’re<br/><em>unsubscribed.</em></>:<>Unsubscribe<br/><em>from emails.</em></>} lead={done==='1'?'You won’t receive marketing emails from us any more. You’ll still get emails about your orders.':email?'Stop marketing emails to '+email+'?':'This link isn’t valid. Please use the link in your most recent email.'}>
  {email&&<form action={confirm} className="auth-form"><input type="hidden" name="e" value={e}/><input type="hidden" name="s" value={s}/><button className="pill auth-submit">Unsubscribe me <span aria-hidden="true">↗</span></button></form>}
  <p className="auth-alt"><a href="/">Back to Replica Landscapes ↗</a></p></AuthLayout>;}
