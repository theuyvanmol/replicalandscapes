import React from 'react';
import {bySlug} from '@/lib/gallery';
/* Building blocks shared by the newer pages, using the same editorial language as the Our Story page. */
export function GImg({slug,sizes='(max-width:900px) 100vw, 50vw',eager,className}:{slug:string;sizes?:string;eager?:boolean;className?:string}){
 const g=bySlug(slug);if(!g)return null;
 return <img className={className} src={`/gallery/img/${g.slug}.webp`} srcSet={`/gallery/img/${g.slug}-sm.webp 800w, /gallery/img/${g.slug}.webp 1800w`} sizes={sizes} width={g.w} height={g.h} alt={g.alt} loading={eager?'eager':'lazy'} decoding="async"/>;
}
export function EdHero({crumbs,eyebrow,title,lead,link,figure,caption}:{crumbs:[string,string?][];eyebrow:string;title:React.ReactNode[];lead?:React.ReactNode;link?:React.ReactNode;figure?:React.ReactNode;caption?:string}){
 return <section className="our-story-hero ed-hero">
  <nav className="story-breadcrumb" aria-label="Breadcrumb">{crumbs.map(([l,h],i)=><React.Fragment key={i}>{i>0&&<span aria-hidden="true">/</span>}{h?<a href={h}>{l}</a>:<span aria-current="page">{l}</span>}</React.Fragment>)}</nav>
  <p className="eyebrow">{eyebrow}</p>
  <h1>{title.map((t,i)=><span className="ed-line" key={i}><span style={{'--d':i} as React.CSSProperties}>{t}</span></span>)}</h1>
  {(lead||link)&&<div className="story-hero-bottom ed-fade">{lead&&<p>{lead}</p>}{link}</div>}
  {figure&&<figure className="ed-hero-figure ed-fade"><div className="ed-hero-img">{figure}</div>{caption&&<figcaption>{caption}</figcaption>}</figure>}
 </section>;
}
export function EdFinal({eyebrow='YOUR NEXT CHAPTER',title,text,children}:{eyebrow?:string;title:React.ReactNode;text:string;children:React.ReactNode}){
 return <section className="story-final ed-final"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{text}</p><div className="story-ctas">{children}</div></section>;
}
