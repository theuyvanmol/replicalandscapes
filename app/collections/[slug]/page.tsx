import {notFound} from 'next/navigation';import StoreShell from '@/components/StoreShell';import Catalogue from '@/components/Catalogue';
import {products} from '@/lib/shopify';import {COLLECTIONS,collectionBySlug} from '@/lib/collections';import {facets} from '@/lib/facets';
export const revalidate=3600;
export function generateStaticParams(){return COLLECTIONS.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const c=collectionBySlug((await params).slug);if(!c)return {};
 return {title:c.title,description:c.description,alternates:{canonical:'/collections/'+c.slug},openGraph:{title:c.title+' | Replica Landscapes',description:c.description,type:'website'}};}
const TYPE_RX:Record<string,RegExp>={Olive:/olive/,Palm:/palm/,Bamboo:/bamboo/,Ficus:/ficus/,Eucalyptus:/eucalyptus/,Blossom:/blossom/,Fern:/fern/,Succulent:/succulent/,Ivy:/ivy/,Grass:/grass/,'Boxwood & buxus':/boxwood|buxus/,Bay:/\bbay\b/,Orchid:/orchid/,Hydrangea:/hydrangea/,Lavender:/lavender/};
export default async function CollectionPage({params}:{params:Promise<{slug:string}>}){
 const c=collectionBySlug((await params).slug);if(!c)notFound();
 const all=(await products()).map(p=>({...p,facets:p.facets||facets(p.title,p.description,p.variants.map(v=>v.title)),description:((p.search||'')+' '+p.description).slice(0,400)}));
 const rx=c!.type?TYPE_RX[c!.type]:null;
 const inC=all.filter(p=>(!c!.category||p.category===c!.category)&&(!rx||rx.test((p.title+' '+(p.search||'')).toLowerCase()))&&(!c!.place||p.facets?.outdoor)&&(!c!.fr||p.facets?.fr));
 const base=process.env.NEXT_PUBLIC_SITE_URL||'';const parent=c!.parent?collectionBySlug(c!.parent):null;
 const children=COLLECTIONS.filter(x=>x.parent===c!.slug);const siblings=parent?COLLECTIONS.filter(x=>x.parent===parent.slug&&x.slug!==c!.slug):[];
 const ld=[{"@context":"https://schema.org","@type":"CollectionPage",name:c!.title,description:c!.description,url:base+'/collections/'+c!.slug,mainEntity:{"@type":"ItemList",numberOfItems:inC.length,itemListElement:inC.slice(0,30).map((p,i)=>({"@type":"ListItem",position:i+1,url:base+'/products/'+p.handle,name:p.title}))}},
  {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:'Home',item:base+'/'},{"@type":"ListItem",position:2,name:'Shop',item:base+'/shop'},...(parent?[{"@type":"ListItem",position:3,name:parent.title,item:base+'/collections/'+parent.slug}]:[]),{"@type":"ListItem",position:parent?4:3,name:c!.title,item:base+'/collections/'+c!.slug}]},
  {"@context":"https://schema.org","@type":"FAQPage",mainEntity:c!.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}];
 return <StoreShell><div className="coll">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <section className="coll-head">
   <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/shop">Shop</a>{parent&&<><span aria-hidden="true">/</span><a href={'/collections/'+parent.slug}>{parent.title}</a></>}<span aria-hidden="true">/</span><span aria-current="page">{c!.title}</span></nav>
   <p className="eyebrow">{inC.length} PIECES</p>
   <h1>{c!.h1[0]} <em>{c!.h1[1]}</em></h1>
   <div className="coll-intro">{c!.intro.map((t,i)=><p key={i} className={i===0?'intro-lead':''}>{t}</p>)}</div>
   {(children.length>0||siblings.length>0)&&<nav className="coll-links" aria-label="Related collections">{(children.length?children:siblings).map(x=><a key={x.slug} href={'/collections/'+x.slug}>{x.title.replace(/^Artificial /,'')}</a>)}</nav>}
  </section>
  <Catalogue items={all} initialCategory={c!.category} initialType={c!.type||''} initialPlace={c!.place||''} initialFr={!!c!.fr} basePath={'/collections/'+c!.slug}/>
  <section className="story-editorial ed-faq coll-faq"><div><p className="eyebrow">GOOD TO KNOW</p><h2>{c!.title.replace(/^Artificial /,'')},<br/><em>answered.</em></h2></div>
   <div className="faq-list">{c!.faqs.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
 </div></StoreShell>;
}
