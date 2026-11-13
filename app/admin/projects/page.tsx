import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {listProjects,STAGES,pendingApprovals,unreadForTeam} from '@/lib/portal';import {createProject} from '@/app/admin/portal-actions';
export const metadata={title:'Projects · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Projects({searchParams}:{searchParams:Promise<{e?:string;saved?:string}>}){const u=await requireStaff();const {e,saved}=await searchParams;const list=await listProjects();
 return <AdminShell user={u} active="/admin/projects" eyebrow="Client portal" title="Projects" actions={<a className="pill" href="#new">New project <span aria-hidden="true">+</span></a>}>
  {saved==='deleted'&&<AdmNotice>Project deleted.</AdmNotice>}{e==='new'&&<AdmNotice kind="error">Add the client’s email and a project name.</AdmNotice>}
  <p className="adm-banner">Each project gets a private page in the client’s account (they sign in with the same email). Move it through the stages, post updates, upload proposals for approval and keep every message in one place.</p>
  {list.length?<ul className="adm-promos">{list.map(p=>{const pa=pendingApprovals(p),nt=unreadForTeam(p);return <li key={p.id}>
   <span className="adm-stage">{p.stage+1}/{STAGES.length}</span><span className="adm-promo-main"><small>{p.ref} · {p.email}</small><b>{p.title}</b><span>{STAGES[p.stage]}{p.site?' · '+p.site:''}</span></span>
   <span>{nt>0&&<span className="adm-status s-live">{nt} new from client</span>}{pa>0&&<span className="adm-status s-sched">{pa} awaiting approval</span>}</span>
   <span className="adm-promo-act"><a href={'/admin/projects/'+p.id}>Open</a></span></li>;})}</ul>
  :<section className="adm-card adm-empty"><h2>No projects yet</h2><p className="adm-muted">Create one for each bespoke client. They’ll see it the moment they sign in.</p></section>}
  <section className="adm-card" id="new"><h2>New project</h2>
   <form action={createProject} className="auth-form compact adm-form-grid">
    <label>Client email<input name="email" type="email" required placeholder="client@company.co.uk"/></label>
    <label>Project name<input name="title" required placeholder="e.g. Restaurant blossom canopy"/></label>
    <label>Site or location<input name="site" placeholder="e.g. The Ivy, Newcastle"/></label>
    <label className="span2">Short summary for the client<textarea name="summary" rows={3} placeholder="What we’re creating together, in a sentence or two."/></label>
    <button className="pill">Create project</button>
    <p className="auth-hint span2">If the client doesn’t have an account yet, ask them to register with this email address and the project will appear.</p>
   </form></section>
 </AdminShell>;}
