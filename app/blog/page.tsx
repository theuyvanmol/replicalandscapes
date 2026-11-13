import StoreShell from '@/components/StoreShell';
import {listPosts,ukFormat,type Post} from '@/lib/content';
export const revalidate=60;
export const metadata={title:'Blog – ideas, care guides and projects',description:'Inspiration, care guides and recent projects from Replica Landscapes, the UK specialists in lifelike artificial trees, plants and living walls.',alternates:{canonical:'/blog'}};
const day=(d:string)=>ukFormat(d,{day:'numeric',month:'long',year:'numeric'});
function Card({p}:{p:Post}){return <article className="blog-card"><a href={'/blog/'+p.slug} className="blog-card-img">{p.cover?<img src={p.cover} alt="" loading="lazy"/>:<span className="blog-noimg"/>}</a>
 <p className="blog-meta"><span>{p.category}</span>{day(p.date)}</p><h3><a href={'/blog/'+p.slug}>{p.title}</a></h3>{p.excerpt&&<p className="blog-excerpt">{p.excerpt}</p>}<a className="blog-more" href={'/blog/'+p.slug}>Read article ↗</a></article>;}
export default async function Blog({searchParams}:{searchParams:Promise<{category?:string}>}){
 const {category=''}=await searchParams;let all:Post[]=[];try{all=await listPosts();}catch{}
 const cats=[...new Set(all.map(p=>p.category).filter(Boolean))];
 const list=category?all.filter(p=>p.category===category):all;
 const [lead,...rest]=list;
 return <StoreShell>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Blog{category&&<> / {category}</>}</nav>
  <div className="store-heading blog-heading"><p className="eyebrow">Notes from the studio</p><h1>{category||'The journal'}.</h1><p>Ideas, care guides and recent projects.</p></div>
  {cats.length>1&&<nav className="blog-cats" aria-label="Blog categories"><a href="/blog" aria-current={!category?'page':undefined}>All</a>{cats.map(c=><a key={c} href={'/blog?category='+encodeURIComponent(c)} aria-current={category===c?'page':undefined}>{c}</a>)}</nav>}
  {!lead?<div className="blog-empty"><span className="blog-empty-arch"/><h2>New stories are on their way.</h2><p>We&rsquo;re putting together ideas, care guides and recent projects. Check back soon.</p><a className="pill" href="/shop">Explore the collection ↗</a></div>:<>
   <article className="blog-lead"><a href={'/blog/'+lead.slug} className="blog-lead-img">{lead.cover?<img src={lead.cover} alt=""/>:<span className="blog-noimg"/>}</a>
    <div className="blog-lead-copy"><p className="blog-meta"><span>{lead.category}</span>{day(lead.date)}</p><h2><a href={'/blog/'+lead.slug}>{lead.title}</a></h2>{lead.excerpt&&<p>{lead.excerpt}</p>}<a className="pill" href={'/blog/'+lead.slug}>Read article ↗</a></div></article>
   {rest.length>0&&<div className="blog-grid">{rest.map(p=><Card key={p.id} p={p}/>)}</div>}
  </>}
 </StoreShell>;
}
