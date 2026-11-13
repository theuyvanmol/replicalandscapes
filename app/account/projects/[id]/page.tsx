import {notFound} from 'next/navigation';
import StoreShell from '@/components/StoreShell';
import {Notice} from '@/components/AuthLayout';
import {requireCustomer} from '@/lib/auth';
import {getProject,markSeen,STAGES,KIND_LABEL,fileUrl,type ProjectFile} from '@/lib/portal';
import {respondToFile,clientMessage} from '@/app/account/portal-actions';
export const metadata={title:'Your project',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const dt=(s:string)=>new Date(s).toLocaleString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const kb=(n:number)=>n?(n>1048576?(n/1048576).toFixed(1)+'MB':Math.round(n/1024)+'KB'):'Link';
function FileRow({f}:{f:ProjectFile}){return <li className="pj-file"><a href={fileUrl(f)} target="_blank" rel="noopener"><span className="pj-file-kind">{KIND_LABEL[f.kind]}</span><b>{f.name}</b><span className="pj-file-meta">{kb(f.size)} · {new Date(f.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span></a>
 {f.approval&&<span className={'care-badge '+(f.approval.status==='approved'?'care-ok':f.approval.status==='changes'?'care-soon':'care-due')}>{f.approval.status==='approved'?'Approved':f.approval.status==='changes'?'Changes requested':'Awaiting your approval'}</span>}</li>;}
export default async function ProjectPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string}>}){
 const u=await requireCustomer();const {id}=await params;const {saved}=await searchParams;const p=await getProject(id);if(!p||p.email!==u.email)notFound();
 const lastSeen=p.seenByClient;await markSeen(p,'client');
 const pending=p.files.filter(f=>f.approval?.status==='pending');const photos=p.files.filter(f=>f.kind==='photo'&&!f.url);const docs=p.files.filter(f=>!(f.kind==='photo'&&!f.url));
 const isNew=(at:string)=>!!lastSeen&&at>lastSeen;
 return <StoreShell><div className="our-story-page ed-page acc pj">
  <section className="our-story-hero ed-hero acc-head">
   <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/account">Your account</a><span aria-hidden="true">/</span><span aria-current="page">{p.ref}</span></nav>
   <p className="eyebrow">PROJECT {p.ref}{p.site?' / '+p.site.toUpperCase():''}</p><h1><span className="ed-line"><span>{p.title}</span></span></h1>
   {p.summary&&<div className="story-hero-bottom ed-fade"><p>{p.summary}</p><a className="text-link" href="#messages">Message the team ↓</a></div>}
  </section>
  {saved==='approved'&&<Notice kind="ok">Thank you. We’ve let the team know you’ve approved it.</Notice>}{saved==='changes'&&<Notice kind="ok">Thank you. The team will review your comments and come back to you.</Notice>}
  <ol className="pj-stages" aria-label="Project stages">{STAGES.map((s,i)=><li key={s} className={i<p.stage?'done':i===p.stage?'now':''}><span>{String(i+1).padStart(2,'0')}</span><b>{s}</b>{i===p.stage&&<small>Current stage</small>}</li>)}</ol>
  {pending.length>0&&<section className="pj-approvals" id="approvals"><div className="ed-section-head"><p className="eyebrow">WAITING FOR YOU</p><h2>Ready for<br/><em>your approval.</em></h2></div>
   {pending.map(f=><article key={f.id} className="pj-approve"><div><span className="pj-file-kind">{KIND_LABEL[f.kind]}</span><h3>{f.name}</h3><a className="text-link" href={fileUrl(f)} target="_blank" rel="noopener">Open and review ↗</a></div>
    <form action={respondToFile} className="ed-form"><input type="hidden" name="project" value={p.id}/><input type="hidden" name="file" value={f.id}/>
     <label>Comments <span>Optional</span><textarea name="note" rows={3} placeholder="Anything you’d like us to change or note?"/></label>
     <div className="pj-approve-btns"><button className="pill" name="decision" value="approved">Approve <span>✓</span></button><button className="adm-btn ghost" name="decision" value="changes">Request changes</button></div></form></article>)}
  </section>}
  <div className="pj-grid">
   <section id="updates"><div className="ed-section-head"><p className="eyebrow">01 / UPDATES</p></div>
    <ol className="pj-feed">{p.updates.map(x=><li key={x.id} className={isNew(x.at)?'is-new':''}><time>{dt(x.at)}</time><p>{x.text}</p><small>{x.by}</small></li>)}</ol></section>
   <section id="files"><div className="ed-section-head"><p className="eyebrow">02 / DOCUMENTS</p></div>
    {docs.length?<ul className="pj-files">{docs.map(f=><FileRow key={f.id} f={f}/>)}</ul>:<p>Proposals, quotes, certificates and invoices will appear here.</p>}
    {photos.length>0&&<><div className="ed-section-head pj-photos-h"><p className="eyebrow">03 / PHOTOS</p></div><div className="pj-photos">{photos.map(f=><a key={f.id} href={fileUrl(f)} target="_blank" rel="noopener"><img src={fileUrl(f)} alt={f.name} loading="lazy"/></a>)}</div></>}
   </section>
  </div>
  <section className="pj-messages" id="messages"><div className="ed-section-head"><p className="eyebrow">MESSAGES</p><h2>Talk to<br/><em>the team.</em></h2></div>
   <ol className="pj-thread">{p.messages.length?p.messages.map(m=><li key={m.id} className={(m.from==='client'?'mine':'theirs')+(isNew(m.at)&&m.from==='team'?' is-new':'')}><p>{m.text}</p><small>{m.from==='client'?'You':m.name+', Replica Landscapes'} · {dt(m.at)}</small></li>):<li className="pj-thread-empty">No messages yet. Ask a question or share an idea below.</li>}</ol>
   <form action={clientMessage} className="ed-form pj-reply"><input type="hidden" name="project" value={p.id}/><label>Your message<textarea name="text" rows={3} required placeholder="Write a message to the team"/></label><div className="ed-form-foot"><button className="pill">Send <span>↗</span></button><p>Prefer to talk? Call 01661 871 481.</p></div></form>
  </section>
 </div></StoreShell>;}
