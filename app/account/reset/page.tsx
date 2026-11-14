import AuthLayout from '@/components/AuthLayout';import {ResetForm} from '@/components/ResetForms';import {peekToken} from '@/lib/security';import {getUser} from '@/lib/auth';import {legacyCustomer} from '@/lib/legacy';
export const metadata={title:'Choose a new password',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Reset({searchParams}:{searchParams:Promise<{t?:string;e?:string}>}){const {t='',e}=await searchParams;const email=e==='expired'?null:await peekToken('reset',t);const u=email?await getUser(email):null;const lc=email&&!u?await legacyCustomer(email):null;
 return <AuthLayout eyebrow="Your account" title={<>Choose a<br/><em>new password.</em></>} lead={u||lc?'For '+email+'.':'This link has expired or has already been used.'}>
  {u||lc?<ResetForm t={t} e={e} needCode={u?.tfa==='on'}/>:<a className="pill" href="/account/forgot">Send a new link <span>↗</span></a>}</AuthLayout>;}
