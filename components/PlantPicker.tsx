"use client";
import {useMemo,useState} from 'react';
import type {PickProduct} from '@/lib/plant-catalogue';
/* Search the catalogue and choose a product + size. Renders form fields only; the surrounding form posts them. */
export default function PlantPicker({items}:{items:PickProduct[]}){
 const [q,setQ]=useState(''),[pick,setPick]=useState<PickProduct|null>(null);
 const res=useMemo(()=>{const t=q.trim().toLowerCase();if(t.length<2)return [];const words=t.split(/\s+/);return items.filter(p=>words.every(w=>(p.title+' '+p.category).toLowerCase().includes(w))).slice(0,8);},[q,items]);
 return <div className="pp">
  <input type="hidden" name="handle" value={pick?.handle||''}/>
  {pick?<div className="pp-chosen"><span className="pp-img">{pick.image&&<img src={pick.image} alt=""/>}</span><span><small>{pick.category}</small><b>{pick.title}</b></span><button type="button" className="pp-change" onClick={()=>{setPick(null);setQ('');}}>Change</button></div>
  :<label className="pp-search">Find the product<input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. olive tree, buxus ball, bay hedge" autoComplete="off"/>
   {res.length>0&&<ul className="pp-results" role="listbox">{res.map(p=><li key={p.handle}><button type="button" onClick={()=>setPick(p)}><span className="pp-img">{p.image&&<img src={p.image} alt="" loading="lazy"/>}</span><span><small>{p.category}</small><b>{p.title}</b></span></button></li>)}</ul>}
   {q.trim().length>=2&&!res.length&&<p className="pp-none">No match. Try a simpler word, like “olive” or “hedge”.</p>}</label>}
  {pick&&pick.sizes.length>0&&<label>Size<select name="size" defaultValue=""><option value="">Not sure</option>{pick.sizes.map(s=><option key={s}>{s}</option>)}</select></label>}
 </div>;}
