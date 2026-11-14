'use client';
import {useEffect,useState} from 'react';import Globe,{type Pt} from '@/components/Globe';
type Live={live:{count:number;pages:[string,number][];countries:[string,number][];points?:Pt[]};today:{visitors:number;pv:number;atc:number;checkout:number}};
const flag=(cc:string)=>cc.length===2?String.fromCodePoint(...[...cc].map(c=>0x1f1a5+c.charCodeAt(0))):'';
const name=(p:string)=>p==='/'?'Homepage':p.replace(/^\/(products|collections|blog)\//,'').replace(/[-/]/g,' ').trim()||p;
/* Refreshes every 15 seconds while the dashboard is open. */
export default function LiveNow({initial,orders=[]}:{initial:Live;orders?:Pt[]}){const [d,setD]=useState(initial);const [at,setAt]=useState('');
 useEffect(()=>{let stop=false;const tick=async()=>{if(document.visibilityState!=='visible')return;try{const r=await fetch('/api/admin/live',{cache:'no-store'});if(r.ok&&!stop){setD(await r.json());setAt(new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));}}catch{}};const t=setInterval(tick,15000);return ()=>{stop=true;clearInterval(t);};},[]);
 return <section className="adm-card live-card" aria-live="polite">
  <div className="live-head"><span className={'live-dot'+(d.live.count?' on':'')} aria-hidden="true"/><h2>Live now</h2>{at&&<small>updated {at}</small>}</div>
  <div className="live-wrap"><Globe live={d.live.points||[]} orders={orders} focus={[54,-2]}/>
  <div className="live-grid">
   <div className="live-big"><b>{d.live.count}</b><span>{d.live.count===1?'person':'people'} on the site in the last 5 minutes</span></div>
   <div><h3>Looking at</h3>{d.live.pages.length?<ul className="live-list">{d.live.pages.map(([p,n])=><li key={p}><a href={p} target="_blank" rel="noopener">{name(p)}</a><span>{n}</span></li>)}</ul>:<p className="adm-muted">Nobody right now.</p>}</div>
   <div><h3>From</h3>{d.live.countries.length?<ul className="live-list">{d.live.countries.map(([c,n])=><li key={c}><span>{flag(c)} {c}</span><span>{n}</span></li>)}</ul>:<p className="adm-muted">–</p>}</div>
   <div><h3>Today so far</h3><ul className="live-list"><li><span>Visitors</span><span>{d.today.visitors}</span></li><li><span>Page views</span><span>{d.today.pv}</span></li><li><span>Added to basket</span><span>{d.today.atc}</span></li><li><span>Went to checkout</span><span>{d.today.checkout}</span></li></ul></div>
  </div></div></section>;
}
