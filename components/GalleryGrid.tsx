"use client";
import {useEffect,useRef,useState} from 'react';
import type {GalleryImage} from '@/lib/gallery';
export default function GalleryGrid({items,cats}:{items:GalleryImage[];cats:string[]}){
 const [cat,setCat]=useState(''),[open,setOpen]=useState<number|null>(null);const dlg=useRef<HTMLDialogElement>(null),grid=useRef<HTMLDivElement>(null);
 const list=cat?items.filter(i=>i.category===cat):items;
 useEffect(()=>{const c=new URLSearchParams(location.search).get('category');if(c&&cats.includes(c))setCat(c);},[cats]);
 useEffect(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});grid.current?.querySelectorAll('.gl-item').forEach(el=>io.observe(el));return()=>io.disconnect();},[cat]);
 useEffect(()=>{const d=dlg.current;if(!d)return;if(open!==null&&!d.open)d.showModal();if(open===null&&d.open)d.close();},[open]);
 useEffect(()=>{if(open===null)return;const k=(e:KeyboardEvent)=>{if(e.key==='ArrowRight')setOpen(o=>o===null?o:(o+1)%list.length);if(e.key==='ArrowLeft')setOpen(o=>o===null?o:(o-1+list.length)%list.length);};addEventListener('keydown',k);return()=>removeEventListener('keydown',k);},[open,list.length]);
 const choose=(c:string)=>{setCat(c);history.replaceState(null,'','/gallery'+(c?'?category='+encodeURIComponent(c):''));};
 const cur=open!==null?list[open]:null;
 return <>
  <nav className="gl-filters" aria-label="Filter the gallery"><button type="button" aria-pressed={!cat} onClick={()=>choose('')}>All projects <sup>{items.length}</sup></button>{cats.map(c=><button type="button" key={c} aria-pressed={cat===c} onClick={()=>choose(c)}>{c} <sup>{items.filter(i=>i.category===c).length}</sup></button>)}</nav>
  <div className="gl-grid" ref={grid} key={cat}>{list.map((im,i)=><figure className="gl-item" key={im.slug} style={{'--i':i%6} as React.CSSProperties}>
   <button type="button" onClick={()=>setOpen(i)} aria-label={'Enlarge: '+im.title}><img src={`/gallery/img/${im.slug}-sm.webp`} srcSet={`/gallery/img/${im.slug}-sm.webp 800w, /gallery/img/${im.slug}.webp 1800w`} sizes="(max-width:600px) 100vw, (max-width:1100px) 50vw, 33vw" width={im.w} height={im.h} alt={im.alt} loading={i<6?'eager':'lazy'} decoding="async"/></button>
   <figcaption><span>{im.category}</span>{im.title}</figcaption></figure>)}</div>
  <dialog ref={dlg} className="gl-box" aria-label="Photo viewer" onClose={()=>setOpen(null)} onClick={e=>{if(e.target===dlg.current)setOpen(null);}}>
   {cur&&<><figure><img src={`/gallery/img/${cur.slug}.webp`} width={cur.w} height={cur.h} alt={cur.alt}/><figcaption><span>{cur.category} · {open!+1} of {list.length}</span><b>{cur.title}</b>{cur.alt}</figcaption></figure>
   <button type="button" className="gl-x" onClick={()=>setOpen(null)} aria-label="Close">×</button>
   <button type="button" className="gl-prev" onClick={()=>setOpen((open!-1+list.length)%list.length)} aria-label="Previous photo">‹</button>
   <button type="button" className="gl-next" onClick={()=>setOpen((open!+1)%list.length)} aria-label="Next photo">›</button></>}
  </dialog>
 </>;
}
