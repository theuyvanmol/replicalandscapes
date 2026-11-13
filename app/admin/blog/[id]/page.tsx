import AdminShell,{AdmNotice} from '@/components/AdminShell';import ImageField from '@/components/ImageField';import {requireStaff} from '@/lib/auth';import {getPost,type Post} from '@/lib/content';import {savePostAction,deletePostAction} from '@/app/admin/content-actions';import {notFound} from 'next/navigation';
export const metadata={title:'Edit post · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const CATS=['Inspiration','Care & guides','Projects','Commercial','Seasonal','News'];
const SAVED:Record<string,string>={publish:'Published. It’s live on the Blog page now.',unpublish:'Moved back to drafts. It’s no longer on the website.',save:'Saved.','1':'Saved.'};
export default async function EditPost({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;e?:string}>}){
 const u=await requireStaff();const {id}=await params;const {saved,e}=await searchParams;
 const isNew=id==='new';const p:Post|null=isNew?null:await getPost(id);if(!isNew&&!p)notFound();
 const v=p||{id:'',slug:'',title:'',excerpt:'',body:'',cover:'',category:'Inspiration',author:u.name,status:'draft',date:new Date().toISOString().slice(0,10),metaDescription:'',updated:''} as Post;
 return <AdminShell user={u} active="/admin/blog" eyebrow={isNew?'New post':v.status==='published'?'Published':'Draft'} title={isNew?'New blog post':v.title} actions={<a className="adm-clear" href="/admin/blog">← All posts</a>}>
  {saved&&SAVED[saved]&&<AdmNotice>{SAVED[saved]}{v.status==='published'&&<> <a href={'/blog/'+v.slug} target="_blank" rel="noopener">View post ↗</a></>}</AdmNotice>}
  {e==='title'&&<AdmNotice kind="error">Please add a title.</AdmNotice>}{e==='confirm'&&<AdmNotice kind="error">Tick the box to confirm you want to delete this post.</AdmNotice>}
  <form action={savePostAction} className="adm-editor"><input type="hidden" name="id" value={v.id}/>
   <div className="adm-editor-main adm-card">
    <label className="ed-title-l" htmlFor="title">Title</label><input className="ed-title" id="title" name="title" defaultValue={v.title} placeholder="e.g. How to style an olive tree indoors" required/>
    <label htmlFor="excerpt">Short summary <span>Shown on the Blog page and in Google (1–2 sentences)</span></label><textarea id="excerpt" name="excerpt" rows={2} defaultValue={v.excerpt}/>
    <label htmlFor="body">Article</label><textarea id="body" name="body" rows={20} defaultValue={v.body} placeholder={'Write your article here.\n\nLeave a blank line between paragraphs.'}/>
    <details className="ed-help"><summary>Formatting help</summary><ul><li><code>## Heading</code> and <code>### Smaller heading</code></li><li><code>- item</code> for bullet points, <code>1. item</code> for numbered steps</li><li><code>**bold**</code>, <code>*italic*</code>, <code>[link text](/shop)</code></li><li><code>&gt; quote</code> for a pull quote</li><li><code>![caption](image address)</code> for a photo inside the article</li></ul></details>
   </div>
   <aside className="adm-editor-side">
    <section className="adm-card"><h2>Publish</h2>
     <label htmlFor="date">Publish date</label><input id="date" name="date" type="date" defaultValue={v.date}/><span className="auth-hint">A future date schedules the post.</span>
     <div className="ed-buttons">{v.status==='published'?<><button className="pill" name="intent" value="save">Update post</button><button className="adm-clear" name="intent" value="unpublish">Move to drafts</button></>:<><button className="pill" name="intent" value="publish">Publish</button><button className="adm-btn ghost" name="intent" value="save">Save draft</button></>}</div></section>
    <section className="adm-card"><ImageField name="cover" label="Cover photo" defaultValue={v.cover} hint="Landscape photos look best. Resized automatically."/></section>
    <section className="adm-card"><h2>Details</h2>
     <label htmlFor="category">Category</label><select id="category" name="category" defaultValue={v.category}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
     <label htmlFor="author">Author</label><input id="author" name="author" defaultValue={v.author}/>
     <label htmlFor="slug">Web address</label><div className="ed-slug"><span>/blog/</span><input id="slug" name="slug" defaultValue={v.slug} placeholder="made from the title"/></div>
     <label htmlFor="metaDescription">Google description <span>Optional, about 155 characters</span></label><textarea id="metaDescription" name="metaDescription" rows={3} defaultValue={v.metaDescription}/></section>
   </aside>
  </form>
  {!isNew&&<form action={deletePostAction} className="adm-danger"><input type="hidden" name="id" value={v.id}/><label><input type="checkbox" name="confirm" value="yes"/> Yes, delete this post permanently</label><button className="adm-remove">Delete post</button></form>}
 </AdminShell>;
}
