import {notFound} from 'next/navigation';
import StoreShell from '@/components/StoreShell';
import Prose from '@/components/Prose';
import {EdFinal} from '@/components/Editorial';
import PostCard from '@/components/PostCard';
import {getPostBySlug,listPosts,ukFormat,imgSet} from '@/lib/content';
export const revalidate=60;
async function load(slug:string){try{const p=await getPostBySlug(slug);return p&&p.status==='published'&&new Date(p.date)<=new Date()?p:null;}catch{return null;}}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=await load(slug);if(!p)return {title:'Article not found'};
 return {title:p.title,description:(p.metaDescription||p.excerpt).slice(0,160),alternates:{canonical:'/blog/'+p.slug},openGraph:{type:'article',title:p.title,description:p.metaDescription||p.excerpt,images:p.cover?[p.cover]:undefined,publishedTime:p.date}};}
export default async function Article({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=await load(slug);if(!p)notFound();
 const more=(await listPosts().catch(()=>[])).filter(x=>x.id!==p.id).slice(0,3);
 const base=process.env.NEXT_PUBLIC_SITE_URL||'';const mins=Math.max(1,Math.round(p.body.split(/\s+/).length/220));const date=ukFormat(p.date,{day:'numeric',month:'long',year:'numeric'});
 const ld={"@context":"https://schema.org","@type":"BlogPosting",headline:p.title,description:p.metaDescription||p.excerpt,datePublished:p.date,dateModified:p.updated||p.date,author:{"@type":"Organization",name:p.author||'Replica Landscapes'},publisher:{"@type":"Organization",name:'Replica Landscapes'},image:p.cover?[p.cover.startsWith('/')?base+p.cover:p.cover]:undefined,mainEntityOfPage:base+'/blog/'+p.slug};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <div className="our-story-page ed-page">
   <section className="our-story-hero ed-hero ed-post-hero">
    <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog">Journal</a><span aria-hidden="true">/</span><span aria-current="page">{p.category}</span></nav>
    <p className="eyebrow">{p.category.toUpperCase()} · {mins} MIN READ</p>
    <h1><span className="ed-line"><span>{p.title}</span></span></h1>
    <div className="story-hero-bottom ed-fade">{p.excerpt&&<p>{p.excerpt}</p>}<p className="ed-byline"><span>{p.author||'Replica Landscapes'}</span><time dateTime={p.date}>{date}</time></p></div>
    {p.cover&&<figure className="ed-hero-figure ed-fade"><div className="ed-hero-img"><img src={p.cover} srcSet={imgSet(p.cover)||undefined} sizes="100vw" alt="" fetchPriority="high"/></div></figure>}
   </section>
   <div className="ed-article">
    <aside className="ed-article-side"><p className="eyebrow">IN THIS STORY</p><p>{p.category}</p><p>{date}</p><a className="text-link" href="/blog">← All stories</a></aside>
    <div className="ed-article-body"><Prose text={p.body}/></div>
   </div>
   {more.length>0&&<section className="ed-cards-section ed-more"><div className="ed-section-head ed-head-row"><div><p className="eyebrow">CONTINUE READING</p><h2>More from<br/><em>the journal.</em></h2></div><a className="text-link" href="/blog">All stories ↗</a></div><div className="ed-cards">{more.map((m,i)=><PostCard key={m.id} p={m} i={i}/>)}</div></section>}
   <EdFinal title={<>Let’s bring your<br/>space to life.</>} text="A single statement tree, a coordinated interior or an ambitious commercial installation. Tell us what you have in mind."><a className="pill" href="/contact">Get in touch <span>↗</span></a><a className="text-link" href="/shop">Explore the collection ↗</a></EdFinal>
  </div></StoreShell>;
}
