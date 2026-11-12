"use client";
import {useState} from 'react';
type Img={url:string;altText:string|null;cutout?:boolean};
export default function ProductGallery({images,title}:{images:Img[];title:string}){const [i,setI]=useState(0);const im=images[i];if(!im)return <div className="detail-photo"/>;
 return <div className="detail-gallery"><a className={'detail-photo'+(im.cutout?' is-cutout':' is-photo')} href={im.url} target="_blank" rel="noopener"><img src={im.url} alt={im.altText||title}/><span>View closer ↗</span></a>
 {images.length>1&&<div className="detail-thumbs">{images.map((t,n)=><button key={t.url} type="button" aria-pressed={n===i} aria-label={'Show photo '+(n+1)} onClick={()=>setI(n)}><img src={t.url} alt=""/></button>)}</div>}
 <p className="image-caption">Original catalogue photography. Decorative pots may be shown; check product specifications.</p></div>}
