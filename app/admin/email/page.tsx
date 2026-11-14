import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {listCampaigns} from '@/lib/mail';import {emailReady} from '@/lib/email';import NewEmailButton from '@/components/NewEmailButton';
export const metadata={title:'Email · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const d=(s?:string)=>s?new Date(s).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
export default async function Emails(){const u=await requireStaff(['owner','admin','editor']);const list=await listCampaigns();
 return <AdminShell user={u} active="/admin/email" eyebrow="MARKETING" title="Email">
  {!emailReady&&<p className="adm-banner">You can design and preview emails now. To send them, connect Resend: add <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> in Vercel once your domain is chosen.</p>}
  <div className="em-top"><p className="adm-muted">Design emails from ready-made blocks: a hero photo, text, products, an offer code and buttons. Only people who agreed to marketing receive them, and every email has an unsubscribe link.</p><NewEmailButton/></div>
  {list.length?<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Email</th><th>Subject</th><th>Status</th><th>Sent</th><th>Updated</th></tr></thead><tbody>
   {list.map(c=><tr key={c.id}><td><a href={'/admin/email/'+c.id}><b>{c.name}</b></a></td><td>{c.subject||<span className="adm-muted">No subject yet</span>}</td><td><span className={'adm-status '+(c.status==='sent'?'s-live':c.status==='sending'?'s-scheduled':'s-draft')}>{c.status}</span></td><td>{c.status!=='draft'?(c.sent||0).toLocaleString('en-GB')+' of '+(c.total||0).toLocaleString('en-GB'):'–'}</td><td>{d(c.updated)}</td></tr>)}
  </tbody></table></div>:<section className="adm-card"><h2>No emails yet</h2><p className="adm-muted">Start with a Black Friday announcement or a “We’ve moved to a new website” email for past customers.</p></section>}
 </AdminShell>;}
