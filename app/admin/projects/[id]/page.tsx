import {notFound} from 'next/navigation';
import AdminShell,{AdmNotice} from '@/components/AdminShell';import ProjectUploader from '@/components/ProjectUploader';import {requireStaff,getUser} from '@/lib/auth';
import {getProject,markSeen,STAGES,KIND_LABEL,fileUrl} from '@/lib/portal';
import {editProject,postUpdate,teamMessage,addLink,removeFile,askApproval,removeProject} from '@/app/admin/portal-actions';
export const metadata={title:'Project · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const dt=(s:string)=>new Date(s).toLocaleString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
export default async function ProjectAdmin({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;e?:string}>}){
 const u=await requireStaff();const {id}=await params;const {saved,e}=await searchParams;const p=await getProject(id);if(!p)notFound();
 const client=await getUser(p.email).catch(()=>null);await markSeen(p,'team');
 return <AdminShell user={u} active="/admin/projects" eyebrow={p.ref+' · '+STAGES[p.stage]} title={p.title} actions={<a className="adm-clear" href="/admin/projects">← All projects</a>}>
  {saved&&<AdmNotice>{saved==='created'?'Project created. The client will see it when they sign in.':'Saved. The client can see this now.'}</AdmNotice>}{e==='confirm'&&<AdmNotice kind="error">Tick the box to confirm deleting this project.</AdmNotice>}
  <p className="adm-banner">{client?<>Client: <b>{client.name}</b> ({p.email}){client.phone?' · '+client.phone:''}. They can see this project in their account.</>:<>No account yet for <b>{p.email}</b>. Ask the client to register with this email to see the project.</>}</p>
  <ol className="adm-stages">{STAGES.map((s,i)=><li key={s} className={i<p.stage?'done':i===p.stage?'now':''}>{s}</li>)}</ol>
  <div className="adm-cols">
   <section className="adm-card"><h2>Details &amp; stage</h2>
    <form action={editProject} className="auth-form compact"><input type="hidden" name="project" value={p.id}/>
     <label>Project name<input name="title" defaultValue={p.title} required/></label>
     <label>Client email<input name="email" type="email" defaultValue={p.email} required/></label>
     <label>Site or location<input name="site" defaultValue={p.site}/></label>
     <label>Summary<textarea name="summary" rows={3} defaultValue={p.summary}/></label>
     <label>Current stage<select name="stage" defaultValue={String(p.stage)}>{STAGES.map((s,i)=><option key={s} value={i}>{i+1}. {s}</option>)}</select></label>
     <span className="auth-hint">Changing the stage posts an update the client can see.</span>
     <button className="pill">Save</button></form></section>
   <section className="adm-card" id="updates"><h2>Post an update</h2>
    <form action={postUpdate} className="auth-form compact"><input type="hidden" name="project" value={p.id}/><label>Update for the client<textarea name="text" rows={4} required placeholder="e.g. Your trees are in production and on track for installation on 3 March."/></label><button className="pill">Post update</button></form>
    <ol className="adm-feed">{p.updates.slice(0,8).map(x=><li key={x.id}><time>{dt(x.at)} · {x.by}</time><p>{x.text}</p></li>)}</ol></section>
  </div>
  <section className="adm-card adm-wide" id="files"><h2>Files &amp; approvals</h2>
   <div className="adm-cols"><ProjectUploader project={p.id}/>
    <form action={addLink} className="auth-form compact pf-up"><input type="hidden" name="project" value={p.id}/><p className="adm-muted"><b>Large file?</b> Share it from Google Drive, Dropbox or WeTransfer and add the link here.</p>
     <label>Link (https://)<input name="url" type="url" required placeholder="https://"/></label><label>Name shown to the client<input name="name"/></label>
     <label>Type<select name="kind" defaultValue="proposal">{Object.entries(KIND_LABEL).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label>
     <label className="auth-check"><input type="checkbox" name="approval"/> Ask the client to approve this</label><button className="adm-btn">Add link</button></form></div>
   {p.files.length>0&&<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>File</th><th>Type</th><th>Added</th><th>Approval</th><th></th></tr></thead><tbody>
    {p.files.map(f=><tr key={f.id}><td><a href={fileUrl(f)} target="_blank" rel="noopener">{f.name}</a></td><td>{KIND_LABEL[f.kind]}</td><td>{dt(f.at)}</td>
     <td>{f.approval?<span className={'adm-status '+(f.approval.status==='approved'?'s-live':f.approval.status==='changes'?'s-sched':'s-draft')}>{f.approval.status==='approved'?'Approved':f.approval.status==='changes'?'Changes requested':'Waiting'}</span>:<form action={askApproval}><input type="hidden" name="project" value={p.id}/><input type="hidden" name="file" value={f.id}/><button className="adm-clear">Ask to approve</button></form>}{f.approval?.note&&<span className="adm-note">“{f.approval.note}”</span>}</td>
     <td><form action={removeFile}><input type="hidden" name="project" value={p.id}/><input type="hidden" name="file" value={f.id}/><button className="adm-remove">Remove</button></form></td></tr>)}
   </tbody></table></div>}
  </section>
  <section className="adm-card adm-wide" id="messages"><h2>Messages</h2>
   <ol className="adm-thread">{p.messages.length?p.messages.map(m=><li key={m.id} className={m.from==='team'?'mine':''}><p>{m.text}</p><small>{m.from==='team'?m.name:(client?.name||'Client')} · {dt(m.at)}</small></li>):<li className="adm-muted">No messages yet.</li>}</ol>
   <form action={teamMessage} className="auth-form compact"><input type="hidden" name="project" value={p.id}/><label>Reply to the client<textarea name="text" rows={3} required/></label><button className="pill">Send message</button></form></section>
  {['owner','admin'].includes(u.role)&&<form action={removeProject} className="adm-danger"><input type="hidden" name="project" value={p.id}/><label><input type="checkbox" name="confirm" value="yes"/> Yes, delete this project and its files</label><button className="adm-remove">Delete project</button></form>}
 </AdminShell>;}
