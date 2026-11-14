"use client";
import {useMemo,useState} from 'react';
import type {PickProduct} from '@/lib/plant-catalogue';
/* Choose and order the products shown in a homepage section. Saves as a hidden JSON field. */
export default function HomePicker({name,items,initial,max=8}:{name:string;items:PickProduct[];initial:string[];max?:number}){
 const by=useMemo(()=>new Map(items.map(p=>[p.handle,p])),[items]);
 const [list,setList]=useState(initial.filter(h=>by.has(h))),[q,setQ]=useState('');
 const res=useMemo(()=>{const t=q.trim().toLowerCase();if(t.length<2)return [];const w=t.split(/\s+/);return items.filter(p=>!list.includes(p.handle)&&w.every(x=>(p.title+' '+p.category).toLowerCase().includes(x))).slice(0,8);},[q,items,list]);
 const move=(i:number,d:number)=>setList(l=>{const n=[...l];const j=i+d;if(j<0||j>=n.length)return n;[n[i],n[j]]=[n[j],n[i]];return n;});
 return <div className="hp">
  <input type="hidden" name={name} value={JSON.stringify(list)}/>
  <ol className="hp-list">{list.map((h,i)=>{const p=by.get(h)!;return <li key={h}><span className="pp-img">{p.image&&<img src={p.image} alt=""/>}</span><span className="hp-name"><small>{p.category}</small><b>{p.title}</b></span>
   <span className="hp-btns"><button type="button" onClick={()=>move(i,-1)} disabled={!i} aria-label="Move up">↑</button><button type="button" onClick={()=>move(i,1)} disabled={i===list.length-1} aria-label="Move down">↓</button><button type="button" onClick={()=>setList(l=>l.filter(x=>x!==h))} aria-label={'Remove '+p.title}>×</button></span></li>;})}</ol>
  {list.length<max?<label className="pp-search">Add a product ({list.length}/{max})<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search the catalogue" autoComplete="off"/>
   {res.length>0&&<ul className="pp-results">{res.map(p=><li key={p.handle}><button type="button" onClick={()=>{setList(l=>[...l,p.handle]);setQ('');}}><span className="pp-img">{p.image&&<img src={p.image} alt="" loading="lazy"/>}</span><span><small>{p.category}</small><b>{p.title}</b></span></button></li>)}</ul>}</label>:<p className="adm-muted">This section shows up to {max} products.</p>}
 </div>;}
