'use client';
import {useMemo,useState} from 'react';
type P={id:string;title:string;img:string;category:string};
/* "Applies to" for a new discount: everything, chosen categories, or chosen products (search and pick). */
export default function DiscountTargets({categories,products}:{categories:{name:string;count:number}[];products:P[]}){
 const [mode,setMode]=useState<'all'|'categories'|'products'>('all');const [cats,setCats]=useState<string[]>([]);const [picked,setPicked]=useState<P[]>([]);const [q,setQ]=useState('');
 const found=useMemo(()=>q.trim().length<2?[]:products.filter(p=>p.title.toLowerCase().includes(q.trim().toLowerCase())&&!picked.some(x=>x.id===p.id)).slice(0,10),[q,products,picked]);
 return <fieldset className="dt">
  <legend>Applies to</legend>
  <div className="dt-modes">{([['all','Everything'],['categories','Chosen categories'],['products','Chosen products']] as const).map(([k,l])=><label key={k} className={mode===k?'is-on':''}><input type="radio" name="target" value={k} checked={mode===k} onChange={()=>setMode(k)}/>{l}</label>)}</div>
  {mode==='categories'&&<div className="dt-cats">{categories.map(c=><label key={c.name} className="auth-check"><input type="checkbox" name="category" value={c.name} checked={cats.includes(c.name)} onChange={e=>setCats(x=>e.target.checked?[...x,c.name]:x.filter(y=>y!==c.name))}/> {c.name} <span className="adm-muted">({c.count})</span></label>)}
   {!cats.length&&<p className="adm-muted">Tick one or more categories.</p>}</div>}
  {mode==='products'&&<div className="dt-prods">
   {picked.length>0&&<ul className="dt-picked">{picked.map(p=><li key={p.id}><input type="hidden" name="product" value={p.id}/>{p.img&&<img src={p.img+(p.img.includes('?')?'&':'?')+'width=80'} alt=""/>}<span>{p.title}<small>{p.category}</small></span><button type="button" onClick={()=>setPicked(x=>x.filter(y=>y.id!==p.id))} aria-label={'Remove '+p.title}>×</button></li>)}</ul>}
   <input className="dt-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, e.g. olive" aria-label="Search products"/>
   {found.length>0&&<ul className="dt-found">{found.map(p=><li key={p.id}><button type="button" onClick={()=>{setPicked(x=>[...x,p].slice(0,100));setQ('');}}>{p.img&&<img src={p.img+(p.img.includes('?')?'&':'?')+'width=80'} alt=""/>}<span>{p.title}<small>{p.category}</small></span><b>+</b></button></li>)}</ul>}
   {!picked.length&&<p className="adm-muted">Search and add the products this discount is for.</p>}</div>}
 </fieldset>;}
