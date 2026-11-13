import {notFound} from 'next/navigation';
import StoreShell from '@/components/StoreShell';
import Prose from '@/components/Prose';
import {getPostBySlug,listPosts,ukFormat} from '@/lib/content';
export const revalidate=60;
async function load(slug:string){try{const p=await getPostBySlug(slug);return p&&p.status==='published'&&new Date(p.date)<=new Date()?p:null;}catch{return null;}}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=await load(slug);if(!p)return {title:'Article not found'};
 return {title:p.title,description:(p.metaDescription||p.excerpt).slice(0,160),alternates:{canonical:'/blog/'+p.slug},openGraph:{type:'article',title:p.title,description:p.metaDescription||p.excerpt,images:p.cover?[p.cover]:undefined,publishedTime:p.date}};}
export default async function Article({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=await load(slug);if(!p)notFound();
 const more=(await listPosts().catch(()=>[])).filter(x=>x.id!==p.id).slice(0,3);
 const base=process.env.NEXT_PUBLIC_SITE_URL||'';
 const ld={"@context":"https://schema.org","@type":"BlogPosting",headline:p.title,description:p.metaDescription||p.excerpt,datePublished:p.date,dateModified:p.updated||p.date,author:{"@type":p.author?"Person":"Organization",name:p.author||'Replica Landscapes'},publisher:{"@type":"Organization",name:'Replica Landscapes'},image:p.cover?[p.cover.startsWith('/')?base+p.cover:p.cover]:undefined,mainEntityOfPage:base+'/blog/'+p.slug};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a> / {p.title}</nav>
  <article className="post">
   <header className="post-head"><p className="eyebrow">{p.category}</p><h1>{p.title}</h1>{p.excerpt&&<p className="post-lede">{p.excerpt}</p>}
    <p className="post-by">{p.author&&<span>By {p.author}</span>}<time dateTime={p.date}>{ukFormat(p.date,{day:'numeric',month:'long',year:'numeric'})}</time></p></header>
   {p.cover&&<figure className="post-cover"><img src={p.cover} alt=""/></figure>}
   <div className="post-body"><Prose text={p.body}/></div>
   <footer className="post-foot"><a className="pill" href="/blog">← All articles</a><a className="pill" href="/bespoke-commercial">Plan a project ↗</a></footer>
  </article>
  {more.length>0&&<section className="post-more"><h2>More from the journal</h2><div className="blog-grid">{more.map(m=><article className="blog-card" key={m.id}><a href={'/blog/'+m.slug} className="blog-card-img">{m.cover?<img src={m.cover} alt="" loading="lazy"/>:<span className="blog-noimg"/>}</a><p className="blog-meta"><span>{m.category}</span>{ukFormat(m.date,{day:'numeric',month:'long',year:'numeric'})}</p><h3><a href={'/blog/'+m.slug}>{m.title}</a></h3><a className="blog-more" href={'/blog/'+m.slug}>Read article ↗</a></article>)}</div></section>}
 </StoreShell>;
}
