import StoreShell from '@/components/StoreShell';
import {EdHero,EdFinal} from '@/components/Editorial';
import PostCard from '@/components/PostCard';
import {listPosts,ukFormat,imgSet,type Post} from '@/lib/content';
export const revalidate=60;
export const metadata={title:'Blog – ideas, care guides and projects',description:'Inspiration, care guides and recent projects from Replica Landscapes, the UK specialists in lifelike artificial trees, plants and living walls.',alternates:{canonical:'/blog'}};
const day=(d:string)=>ukFormat(d,{day:'numeric',month:'long',year:'numeric'});
export default async function Blog({searchParams}:{searchParams:Promise<{category?:string}>}){
 const {category=''}=await searchParams;let all:Post[]=[];try{all=await listPosts();}catch{}
 const cats=[...new Set(all.map(p=>p.category).filter(Boolean))];
 const list=category?all.filter(p=>p.category===category):all;
 const [lead,...rest]=list;
 return <StoreShell><div className="our-story-page ed-page">
  <EdHero crumbs={[['Home','/'],['Journal',category?'/blog':undefined],...(category?[[category] as [string]]:[])]} eyebrow="THE REPLICA LANDSCAPES JOURNAL" title={['Notes on',<em key="e">living green.</em>]}
   lead="Ideas, care guides and recent projects from our studio in Northumberland." link={cats.length>1?undefined:<a className="text-link" href="/gallery">See our projects ↗</a>}/>
  {cats.length>1&&<nav className="ed-tabs" aria-label="Journal topics"><a href="/blog" aria-current={!category?'page':undefined}>All stories <sup>{all.length}</sup></a>{cats.map(c=><a key={c} href={'/blog?category='+encodeURIComponent(c)} aria-current={category===c?'page':undefined}>{c} <sup>{all.filter(p=>p.category===c).length}</sup></a>)}</nav>}
  {!lead?<EdFinal eyebrow="COMING SOON" title={<>New stories are<br/>on their way.</>} text="We’re putting together ideas, care guides and recent projects. In the meantime, explore our work."><a className="pill" href="/gallery">View the gallery <span>↗</span></a><a className="text-link" href="/shop">Explore the collection ↗</a></EdFinal>:<>
   <article className="ed-feature"><a className="ed-feature-img" href={'/blog/'+lead.slug} aria-label={lead.title}>{lead.cover?<img src={lead.cover} srcSet={imgSet(lead.cover)||undefined} sizes="(max-width:900px) 100vw, 55vw" alt=""/>:<span className="ed-noimg"/>}<span className="ed-tag">LATEST STORY</span></a>
    <div><p className="eyebrow">{lead.category.toUpperCase()} · {day(lead.date).toUpperCase()}</p><h2><a href={'/blog/'+lead.slug}>{lead.title}</a></h2>{lead.excerpt&&<p className="intro-lead">{lead.excerpt}</p>}<a className="text-link" href={'/blog/'+lead.slug}>Read the story ↗</a></div></article>
   {rest.length>0&&<section className="ed-cards-section"><div className="ed-section-head"><p className="eyebrow">MORE FROM THE JOURNAL</p></div><div className="ed-cards">{rest.map((p,i)=><PostCard key={p.id} p={p} i={i+1}/>)}</div></section>}
  </>}
 </div></StoreShell>;
}
