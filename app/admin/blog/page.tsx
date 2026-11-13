import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {listPosts} from '@/lib/content';
export const metadata={title:'Blog · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function BlogAdmin({searchParams}:{searchParams:Promise<{saved?:string}>}){
 const u=await requireStaff();const {saved}=await searchParams;const posts=await listPosts({drafts:true});
 const today=new Date().toISOString().slice(0,10);
 const state=(p:{status:string;date:string})=>p.status!=='published'?['Draft','draft']:p.date>today?['Scheduled','sched']:['Published','live'];
 return <AdminShell user={u} active="/admin/blog" eyebrow={posts.length+' posts'} title="Blog" actions={<a className="pill" href="/admin/blog/new">New post <span aria-hidden="true">+</span></a>}>
  {saved==='deleted'&&<AdmNotice>Post deleted.</AdmNotice>}
  {posts.length?<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th></th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
   {posts.map(p=>{const [l,c]=state(p);return <tr key={p.id}><td className="thumb">{p.cover&&<img src={p.cover} alt=""/>}</td><td><b>{p.title}</b><span>/blog/{p.slug}</span></td><td>{p.category}</td><td>{new Date(p.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td><td><span className={'adm-status s-'+c}>{l}</span></td><td><a href={'/admin/blog/'+p.id}>Edit</a>{p.status==='published'&&<> · <a href={'/blog/'+p.slug} target="_blank" rel="noopener">View ↗</a></>}</td></tr>;})}
  </tbody></table></div>:<section className="adm-card adm-empty"><h2>Write your first post</h2><p className="adm-muted">Share care guides, styling ideas, project stories and seasonal news. Posts appear on the Blog page as soon as you publish.</p><a className="pill" href="/admin/blog/new">New post <span aria-hidden="true">+</span></a></section>}
 </AdminShell>;
}
