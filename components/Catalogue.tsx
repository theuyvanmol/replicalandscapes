"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Product} from '@/lib/shopify';

/* Sub-categories shown under each category, matched against product names and tags. */
const TYPES:Record<string,[string,string][]>={
 'Trees':[['Olive','olive'],['Palm','palm'],['Bamboo','bamboo'],['Ficus','ficus'],['Eucalyptus','eucalyptus'],['Blossom','blossom'],['Wisteria','wisteria'],['Fruit','fruit|orange|lemon|lime'],['Oak','oak'],['Maple','maple'],['Indoor','indoor'],['Outdoor','outdoor|uv']],
 'Plants & grasses':[['Cactus','cactus|cacti'],['Fern','fern'],['Succulent','succulent'],['Grass','grass'],['Ivy','ivy'],['Trailing','trailing|hanging'],['Herb','herb'],['Yucca','yucca'],['Sansevieria','sansevieria'],['Monstera','monstera'],['Palm','palm']],
 'Topiary & bay':[['Boxwood & buxus','boxwood|buxus'],['Cedar, cypress & juniper','cedar|cypress|juniper'],['Bay','bay'],['Spiral','spiral'],['Ball','ball'],['Lollipop','lollipop'],['Cone','cone|tower']],
 'Flowers & foliage':[['Arrangement','arrangement'],['Bouquet','bouquet'],['Hydrangea','hydrangea'],['Peony','peony|peonies'],['Rose','rose'],['Orchid','orchid'],['Lavender','lavender'],['Stem','stem|spray'],['Garland','garland'],['Foliage','foliage|leaf|leaves']],
 'Hedging & screens':[['Hedge','hedge|hedging'],['Fence','fence|fencing'],['Screen','screen'],['Trellis','trellis'],['Panel','panel|mat']],
 'Living walls & moss':[['Living wall panels','wall|panel'],['Moss','moss']],
 'Planters & troughs':[['Pots','pot'],['Troughs','trough'],['Planters','planter'],['Baskets','basket']],
 'Christmas':[['Wreaths','wreath'],['Garlands','garland'],['Christmas trees','tree'],['Poinsettia','poinsettia']],
};
const ORDER=['Trees','Plants & grasses','Topiary & bay','Flowers & foliage','Hedging & screens','Living walls & moss','Planters & troughs','Trough fillers','Christmas'];
const PAGE=24;
const terms=(t:string)=>(TYPES_BY_LABEL[t.toLowerCase()]||t.toLowerCase().split(/\s*(?:,|&|\|)\s*/)).filter(Boolean);
const TYPES_BY_LABEL:Record<string,string[]>=Object.fromEntries(Object.values(TYPES).flat().map(([l,r])=>[l.toLowerCase(),r.split('|')]));
const hay=(p:Product)=>(p.title+' '+p.description).toLowerCase();
const matchType=(p:Product,type:string)=>{const ts=terms(type);const h=hay(p);return ts.some(t=>new RegExp('\\b'+t.replace(/[.*+?^${}()[\]\\]/g,'\\$&')).test(h));};
const fmt=(v:string|null,c:string)=>v===null?null:new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).format(Number(v));

export default function Catalogue({items,initialCategory='',initialQuery='',initialType=''}:{items:Product[];initialCategory?:string;initialQuery?:string;initialType?:string}){
 const [category,setCategory]=useState(initialCategory),[type,setType]=useState(initialType),[query,setQuery]=useState(initialQuery),[draft,setDraft]=useState(initialQuery),[sort,setSort]=useState('featured'),[page,setPage]=useState(1);
 const dialog=useRef<HTMLDialogElement>(null),top=useRef<HTMLDivElement>(null);
 const categories=useMemo(()=>{const c=new Map<string,number>();items.forEach(p=>c.set(p.category,(c.get(p.category)||0)+1));const rank=(x:string)=>{const i=ORDER.indexOf(x);return i<0?99:i;};return [...c.keys()].sort((a,b)=>rank(a)-rank(b));},[items]);
 const subtypes=useMemo(()=>Object.fromEntries(categories.map(c=>[c,(TYPES[c]||[]).map(([l])=>[l,items.filter(p=>p.category===c&&matchType(p,l)).length] as [string,number]).filter(([,n])=>n>0)])),[items,categories]);
 let list=items.filter(p=>(!category||p.category===category)&&(!type||matchType(p,type))&&(!query||hay(p).includes(query.toLowerCase())));
 if(sort==='low')list=[...list].sort((a,b)=>Number(a.price??Infinity)-Number(b.price??Infinity));
 if(sort==='high')list=[...list].sort((a,b)=>Number(b.price??-1)-Number(a.price??-1));
 if(sort==='name')list=[...list].sort((a,b)=>a.title.localeCompare(b.title));
 const pages=Math.ceil(list.length/PAGE);
 useEffect(()=>{const q=new URLSearchParams();if(category)q.set('category',category);if(type)q.set('type',type);if(query)q.set('q',query);const qs=q.toString();history.replaceState(null,'','/shop'+(qs?'?'+qs:''));},[category,type,query]);
 useEffect(()=>{if(location.hash==='#search')document.getElementById('search')?.focus();},[]);
 const pick=(c:string,t='')=>{setCategory(c);setType(t);setPage(1);dialog.current?.close();};
 const heading=type?type.charAt(0).toUpperCase()+type.slice(1):category||'The collection';
 const filters=<aside className="shop-filters" aria-label="Shop by category">
  <h2>Shop by category</h2>
  <button type="button" className={'category-all'+(!category?' selected':'')} onClick={()=>pick('')}>Shop all</button>
  {categories.map(c=><details key={c} open={category===c}><summary>{c}</summary>
   <button type="button" className={'category-option'+(category===c&&!type?' selected':'')} onClick={()=>pick(c)}>All {c.toLowerCase()}</button>
   {subtypes[c]?.map(([l])=><button type="button" key={l} className={'category-option'+(category===c&&type===l?' selected':'')} onClick={()=>pick(c,l)}>{l}</button>)}
  </details>)}
  {(category||type||query)&&<button type="button" className="clear-filters" onClick={()=>{pick('');setQuery('');setDraft('');}}>Clear filters</button>}
 </aside>;
 return <>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop" onClick={e=>{e.preventDefault();pick('');}}>Shop</a>{category&&<> / {category}</>}{type&&<> / {heading}</>}</nav>
  <div className="store-heading" ref={top}><p className="eyebrow">Considered greenery. Lasting character.</p><h1>{heading}.</h1><p>Find your perfect statement piece.</p></div>
  <div className="store-layout">
   {filters}
   <section aria-label="Products">
    <div className="shop-toolbar"><div><h2>{heading}</h2><span>{list.length} products</span><button type="button" className="filter-toggle" onClick={()=>dialog.current?.showModal()}>Filter &amp; categories</button></div>
     <label>Sort<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option></select></label></div>
    <form className="catalogue-search" role="search" onSubmit={e=>{e.preventDefault();setQuery(draft.trim());setPage(1);}}><label className="sr-only" htmlFor="search">Search products</label><input id="search" placeholder="Find a plant, tree or flower…" value={draft} onChange={e=>{setDraft(e.target.value);if(!e.target.value){setQuery('');}}}/><button>Search ↗</button></form>
    {list.length?<div className="shop-grid">{list.slice((page-1)*PAGE,page*PAGE).map(p=>{const im=p.images[0];const cut=!!im?.cutout;const href='/products/'+p.handle;const price=fmt(p.price,p.currency);const many=p.variants.length>1;
     const spec=many?p.variants.length+' options':(p.variants[0]&&!/^(standard|as shown)$/i.test(p.variants[0].title)?p.variants[0].title:p.category);
     return <article className="shop-card" key={p.id}>
      <div className={'sculpture '+(cut?'has-cutout':'photo-sculpture')}><a className="sculpture-link" href={href} aria-label={p.title}><span className="arched-backplate"/><span className="stone-plinth"/>{im&&<img className="sculpture-plant" src={im.url} alt={im.altText||p.title} loading="lazy"/>}</a><a className="quick-look" href={href} aria-label={'View '+p.title}>+</a></div>
      <a className="shop-name" href={href}>{p.title}</a><p className="shop-spec">{spec}</p>
      <div className="shop-card-bottom"><strong>{price?(many?'From ':'')+price:'Enquire for pricing'}</strong><a href={href}>View options ↗</a></div>
     </article>})}</div>
    :<div className="no-products"><h2>No products match.</h2><p>Try another category or clear your search.</p><button type="button" className="clear-filters" onClick={()=>{pick('');setQuery('');setDraft('');}}>Clear filters</button></div>}
    {pages>1&&<div className="pagination">{Array.from({length:pages},(_,i)=><button type="button" key={i} aria-current={page===i+1?'page':undefined} onClick={()=>{setPage(i+1);top.current?.scrollIntoView({behavior:'smooth'});}}>{i+1}</button>)}</div>}
   </section>
  </div>
  <dialog id="filterDialog" ref={dialog} aria-label="Filter and categories"><button type="button" className="filter-close" onClick={()=>dialog.current?.close()}>Close ×</button>{filters}</dialog>
 </>;
}
