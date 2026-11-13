"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Product} from '@/lib/shopify';
import {fmtHeight} from '@/lib/facets';

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
const HEIGHTS:[string,number,number][]=[['Under 60cm',0,59],['60cm – 1.2m',60,120],['1.2m – 1.8m',121,180],['Over 1.8m',181,9999]];
const PRICES:[string,number,number][]=[['Under £50',0,49.99],['£50 – £150',50,150],['£150 – £300',150.01,300],['Over £300',300.01,1e9]];
const priceNum=(p:Product)=>p.price===null?null:Number(p.price);
const terms=(t:string)=>(TYPES_BY_LABEL[t.toLowerCase()]||t.toLowerCase().split(/\s*(?:,|&|\|)\s*/)).filter(Boolean);
const TYPES_BY_LABEL:Record<string,string[]>=Object.fromEntries(Object.values(TYPES).flat().map(([l,r])=>[l.toLowerCase(),r.split('|')]));
const hay=(p:Product)=>(p.title+' '+p.description).toLowerCase();
const matchType=(p:Product,type:string)=>{const ts=terms(type);const h=hay(p);return ts.some(t=>new RegExp('\\b'+t.replace(/[.*+?^${}()[\]\\]/g,'\\$&')).test(h));};
const fmt=(v:string|null,c:string)=>v===null?null:new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).format(Number(v));

export default function Catalogue({items,initialCategory='',initialQuery='',initialType=''}:{items:Product[];initialCategory?:string;initialQuery?:string;initialType?:string}){
 const [height,setHeight]=useState(''),[place,setPlace]=useState(''),[fr,setFr]=useState(false),[price,setPrice]=useState('');
 const [category,setCategory]=useState(initialCategory),[type,setType]=useState(initialType),[query,setQuery]=useState(initialQuery),[draft,setDraft]=useState(initialQuery),[sort,setSort]=useState('featured'),[page,setPage]=useState(1);
 const dialog=useRef<HTMLDialogElement>(null),top=useRef<HTMLDivElement>(null);
 const categories=useMemo(()=>{const c=new Map<string,number>();items.forEach(p=>c.set(p.category,(c.get(p.category)||0)+1));const rank=(x:string)=>{const i=ORDER.indexOf(x);return i<0?99:i;};return [...c.keys()].sort((a,b)=>rank(a)-rank(b));},[items]);
 const subtypes=useMemo(()=>Object.fromEntries(categories.map(c=>[c,(TYPES[c]||[]).map(([l])=>[l,items.filter(p=>p.category===c&&matchType(p,l)).length] as [string,number]).filter(([,n])=>n>0)])),[items,categories]);
 const inH=(p:Product,lab:string)=>{const b=HEIGHTS.find(h=>h[0]===lab);return !!b&&(p.facets?.heights||[]).some(h=>h>=b[1]&&h<=b[2]);};
 const inP=(p:Product,lab:string)=>{const b=PRICES.find(x=>x[0]===lab);const n=priceNum(p);return !!b&&n!==null&&n>=b[1]&&n<=b[2];};
 const base=items.filter(p=>(!category||p.category===category)&&(!type||matchType(p,type))&&(!query||hay(p).includes(query.toLowerCase())));
 const pass=(p:Product,skip='')=>(skip==='h'||!height||inH(p,height))&&(skip==='w'||!place||(place==='outdoor'?!!p.facets?.outdoor:true))&&(skip==='f'||!fr||!!p.facets?.fr)&&(skip==='p'||!price||inP(p,price));
 let list=base.filter(p=>pass(p));
 const nH=(lab:string)=>base.filter(p=>pass(p,'h')&&inH(p,lab)).length,nP=(lab:string)=>base.filter(p=>pass(p,'p')&&inP(p,lab)).length;
 const nOut=base.filter(p=>pass(p,'w')&&p.facets?.outdoor).length,nFr=base.filter(p=>pass(p,'f')&&p.facets?.fr).length;
 const refined=!!(height||place||fr||price);
 const clearRefine=()=>{setHeight('');setPlace('');setFr(false);setPrice('');setPage(1);};
 if(sort==='low')list=[...list].sort((a,b)=>Number(a.price??Infinity)-Number(b.price??Infinity));
 if(sort==='high')list=[...list].sort((a,b)=>Number(b.price??-1)-Number(a.price??-1));
 if(sort==='name')list=[...list].sort((a,b)=>a.title.localeCompare(b.title));
 const pages=Math.ceil(list.length/PAGE);
 useEffect(()=>{const q=new URLSearchParams(location.search);const h=q.get('height');if(h&&HEIGHTS.some(x=>x[0]===h))setHeight(h);if(q.get('use')==='outdoor')setPlace('outdoor');if(q.get('fr')==='1')setFr(true);const pr=q.get('price');if(pr&&PRICES.some(x=>x[0]===pr))setPrice(pr);},[]);
 useEffect(()=>{const q=new URLSearchParams();if(category)q.set('category',category);if(type)q.set('type',type);if(query)q.set('q',query);if(height)q.set('height',height);if(place)q.set('use',place);if(fr)q.set('fr','1');if(price)q.set('price',price);const qs=q.toString();history.replaceState(null,'','/shop'+(qs?'?'+qs:''));},[category,type,query,height,place,fr,price]);
 useEffect(()=>{if(location.hash==='#search')document.getElementById('search')?.focus();},[]);
 const pick=(c:string,t='')=>{setCategory(c);setType(t);setPage(1);dialog.current?.close();};
 const heading=type?type.charAt(0).toUpperCase()+type.slice(1):category||'The collection';
 const filters=<aside className="shop-filters" aria-label="Shop by category">
  <div className="refine">
   <h2>Refine</h2>
   <fieldset><legend>Height</legend>{HEIGHTS.map(([l])=>{const n=nH(l);return <label key={l} className={n?'':'is-empty'}><input type="radio" name="h" checked={height===l} onChange={()=>{setHeight(height===l?'':l);setPage(1);}} onClick={()=>{if(height===l){setHeight('');setPage(1);}}}/><span>{l}</span><sup>{n}</sup></label>;})}</fieldset>
   <fieldset><legend>Where it goes</legend><label><input type="radio" name="w" checked={!place} onChange={()=>{setPlace('');setPage(1);}}/><span>Indoors (all products)</span></label><label className={nOut?'':'is-empty'}><input type="radio" name="w" checked={place==='outdoor'} onChange={()=>{setPlace('outdoor');setPage(1);}}/><span>Outdoors (UV-protected)</span><sup>{nOut}</sup></label></fieldset>
   <fieldset><legend>Commercial spaces</legend><label className={nFr?'':'is-empty'}><input type="checkbox" checked={fr} onChange={e=>{setFr(e.target.checked);setPage(1);}}/><span>Fire-retardant</span><sup>{nFr}</sup></label></fieldset>
   <fieldset><legend>Price</legend>{PRICES.map(([l])=>{const n=nP(l);return <label key={l} className={n?'':'is-empty'}><input type="radio" name="p" checked={price===l} onChange={()=>{setPrice(l);setPage(1);}} onClick={()=>{if(price===l){setPrice('');setPage(1);}}}/><span>{l}</span><sup>{n}</sup></label>;})}</fieldset>
  </div>
  <h2 className="cat-h">Shop by category</h2>
  <button type="button" className={'category-all'+(!category?' selected':'')} onClick={()=>pick('')}>Shop all</button>
  {categories.map(c=><details key={c} open={category===c}><summary>{c}</summary>
   <button type="button" className={'category-option'+(category===c&&!type?' selected':'')} onClick={()=>pick(c)}>All {c.toLowerCase()}</button>
   {subtypes[c]?.map(([l])=><button type="button" key={l} className={'category-option'+(category===c&&type===l?' selected':'')} onClick={()=>pick(c,l)}>{l}</button>)}
  </details>)}
  {(category||type||query||refined)&&<button type="button" className="clear-filters" onClick={()=>{pick('');setQuery('');setDraft('');clearRefine();}}>Clear all filters</button>}
 </aside>;
 return <>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop" onClick={e=>{e.preventDefault();pick('');}}>Shop</a>{category&&<> / {category}</>}{type&&<> / {heading}</>}</nav>
  <div className="store-heading" ref={top}><p className="eyebrow">Considered greenery. Lasting character.</p><h1>{heading}.</h1><p>Find your perfect statement piece.</p></div>
  <div className="store-layout">
   {filters}
   <section aria-label="Products">
    <div className="shop-toolbar"><div><h2>{heading}</h2><span>{list.length} products</span><button type="button" className="filter-toggle" onClick={()=>dialog.current?.showModal()}>Filter &amp; categories</button></div>
     <label>Sort<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option></select></label></div>
    {refined&&<div className="refine-chips" aria-label="Active filters">{height&&<button type="button" onClick={()=>setHeight('')}>{height} ×</button>}{place&&<button type="button" onClick={()=>setPlace('')}>Outdoors ×</button>}{fr&&<button type="button" onClick={()=>setFr(false)}>Fire-retardant ×</button>}{price&&<button type="button" onClick={()=>setPrice('')}>{price} ×</button>}<button type="button" className="chip-clear" onClick={clearRefine}>Clear</button></div>}
    <form className="catalogue-search" role="search" onSubmit={e=>{e.preventDefault();setQuery(draft.trim());setPage(1);}}><label className="sr-only" htmlFor="search">Search products</label><input id="search" placeholder="Find a plant, tree or flower…" value={draft} onChange={e=>{setDraft(e.target.value);if(!e.target.value){setQuery('');}}}/><button>Search ↗</button></form>
    {list.length?<div className="shop-grid">{list.slice((page-1)*PAGE,page*PAGE).map(p=>{const im=p.images[0];const cut=!!im?.cutout;const href='/products/'+p.handle;const price=fmt(p.price,p.currency);const many=p.variants.length>1;
     const hs=p.facets?.heights||[];const hRange=hs.length?(hs.length>1?fmtHeight(hs[0])+' – '+fmtHeight(hs[hs.length-1]):fmtHeight(hs[0])):'';
     const spec=[hRange,many?p.variants.length+' sizes':'',p.facets?.outdoor?'Indoor & outdoor':''].filter(Boolean).join(' · ')||(p.variants[0]&&!/^(standard|as shown)$/i.test(p.variants[0].title)?p.variants[0].title:p.category);
     return <article className="shop-card" key={p.id}>
      <div className={'sculpture '+(cut?'has-cutout':'photo-sculpture')}><a className="sculpture-link" href={href} aria-label={p.title}><span className="arched-backplate"/><span className="stone-plinth"/>{im&&<img className="sculpture-plant" src={im.url} alt={im.altText||p.title} loading="lazy"/>}</a><a className="quick-look" href={href} aria-label={'View '+p.title}>+</a></div>
      <a className="shop-name" href={href}>{p.title}</a><p className="shop-spec">{spec}</p>
      <div className="shop-card-bottom"><strong>{price?(many?'From ':'')+price:'Enquire for pricing'}</strong><a href={href}>View options ↗</a></div>
     </article>})}</div>
    :<div className="no-products"><h2>No products match.</h2><p>Try fewer filters, or call us on 01661 871 481: many trees can be made to a bespoke size.</p><button type="button" className="clear-filters" onClick={()=>{pick('');setQuery('');setDraft('');clearRefine();}}>Clear all filters</button></div>}
    {pages>1&&<div className="pagination">{Array.from({length:pages},(_,i)=><button type="button" key={i} aria-current={page===i+1?'page':undefined} onClick={()=>{setPage(i+1);top.current?.scrollIntoView({behavior:'smooth'});}}>{i+1}</button>)}</div>}
   </section>
  </div>
  <dialog id="filterDialog" ref={dialog} aria-label="Filter and categories"><button type="button" className="filter-close" onClick={()=>dialog.current?.close()}>Close ×</button>{filters}</dialog>
 </>;
}
