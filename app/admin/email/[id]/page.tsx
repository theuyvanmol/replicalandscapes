import {notFound} from 'next/navigation';import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {getCampaign} from '@/lib/mail';import {emailReady} from '@/lib/email';import {products} from '@/lib/shopify';import EmailEditor from '@/components/EmailEditor';
export const metadata={title:'Edit email · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function EditEmail({params}:{params:Promise<{id:string}>}){const u=await requireStaff(['owner','admin','editor']);const c=await getCampaign((await params).id);if(!c)notFound();
 const items=(await products()).filter(p=>p.images.length).map(p=>({handle:p.handle,title:p.title,img:p.images[0].url}));
 return <AdminShell user={u} active="/admin/email" eyebrow={c.status==='draft'?'DRAFT EMAIL':c.status.toUpperCase()} title={c.name}>
  <EmailEditor initial={c} products={items} canSend={['owner','admin'].includes(u.role)} ready={emailReady} me={u.email}/></AdminShell>;}
