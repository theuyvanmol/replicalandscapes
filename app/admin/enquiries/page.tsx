import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {listEnquiries} from '@/lib/enquiries';import {ukFormat} from '@/lib/content';import {toggleRead,removeEnquiry} from './actions';
export const metadata={title:'Enquiries · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Enquiries(){const u=await requireStaff();const list=await listEnquiries();const unread=list.filter(e=>!e.read).length;
 return <AdminShell user={u} active="/admin/enquiries" eyebrow={unread?unread+' new':'Inbox'} title="Enquiries">
  <p className="adm-banner">Messages sent from the Contact page. Reply by email or phone; mark each one as done when it has been handled.</p>
  {list.length?<ul className="adm-enq">{list.map(e=><li key={e.id} className={e.read?'is-read':''}>
   <div className="adm-enq-head"><span className={'adm-status '+(e.read?'s-draft':'s-live')}>{e.read?'Done':'New'}</span><b>{e.name}</b><span>{e.topic}</span><time>{ukFormat(e.at)}</time></div>
   <p className="adm-enq-msg">{e.message}</p>
   <div className="adm-enq-foot"><a href={`mailto:${e.email}?subject=${encodeURIComponent('Re: your enquiry to Replica Landscapes')}`}>{e.email}</a>{e.phone&&<a href={'tel:'+e.phone.replace(/\s/g,'')}>{e.phone}</a>}
    <form action={toggleRead}><input type="hidden" name="id" value={e.id}/><input type="hidden" name="read" value={e.read?'0':'1'}/><button className="adm-clear">{e.read?'Mark as new':'Mark as done'}</button></form>
    {['owner','admin'].includes(u.role)&&<form action={removeEnquiry}><input type="hidden" name="id" value={e.id}/><button className="adm-remove">Delete</button></form>}</div></li>)}</ul>
  :<section className="adm-card adm-empty"><h2>No enquiries yet</h2><p className="adm-muted">When someone sends a message from the Contact page it appears here.</p><a className="adm-clear" href="/contact" target="_blank">Open the Contact page ↗</a></section>}
 </AdminShell>;}
