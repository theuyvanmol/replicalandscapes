'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import ImageField from '@/components/ImageField';
import NewEmailButton from '@/components/NewEmailButton';
type Block={t:string;[k:string]:any};type Campaign={id:string;name:string;subject:string;preheader:string;blocks:Block[];status:string;total?:number;sent?:number;failed?:number};
type Prod={handle:string;title:string;img:string};
const LABEL:Record<string,string>={hero:'Hero photo & headline',heading:'Heading',text:'Text',button:'Button',image:'Photo',products:'Products',offer:'Offer code',divider:'Divider'};
const NEW:Record<string,Block>={hero:{t:'hero',img:'',title:'Headline',text:''},heading:{t:'heading',text:'A new section'},text:{t:'text',text:''},button:{t:'button',label:'Shop now',url:'/shop'},image:{t:'image',img:'',alt:'',url:''},products:{t:'products',handles:[]},offer:{t:'offer',code:'BLACKFRIDAY',text:'25% off everything this weekend.'},divider:{t:'divider'}};
const api=async(body:object)=>{const r=await fetch('/api/admin/email',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({error:'Something went wrong.'}));if(!r.ok)throw new Error(j.error||'Something went wrong.');return j;};
/* Block-based email designer with a live preview, test send and sending progress. */
export default function EmailEditor({initial,products,canSend,ready,me}:{initial:Campaign;products:Prod[];canSend:boolean;ready:boolean;me:string}){
 const [c,setC]=useState<Campaign>(initial);const [html,setHtml]=useState('');const [msg,setMsg]=useState<[string,'ok'|'error']|null>(null);const [dirty,setDirty]=useState(false);
 const [count,setCount]=useState<number|null>(null);const [mobile,setMobile]=useState(false);const [busy,setBusy]=useState('');const [q,setQ]=useState('');
 const locked=c.status!=='draft';const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const set=(patch:Partial<Campaign>)=>{if(locked)return;setC(x=>({...x,...patch}));setDirty(true);};
 const setBlock=(i:number,patch:object)=>set({blocks:c.blocks.map((b,k)=>k===i?{...b,...patch}:b)});
 const move=(i:number,d:number)=>{const b=[...c.blocks];const j=i+d;if(j<0||j>=b.length)return;[b[i],b[j]]=[b[j],b[i]];set({blocks:b});};
 useEffect(()=>{if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(async()=>{try{const j=await api({op:'preview',id:c.id,campaign:c});setHtml(j.html);}catch{}},400);},[c]);
 useEffect(()=>{if(!dirty||locked)return;const t=setTimeout(async()=>{try{await api({op:'save',id:c.id,campaign:c});setDirty(false);}catch(e){setMsg([(e as Error).message,'error']);}},1200);return ()=>clearTimeout(t);},[c,dirty,locked]);
 useEffect(()=>{api({op:'count',id:c.id}).then(j=>setCount(j.count)).catch(()=>{});},[c.id]);
 useEffect(()=>{if(c.status!=='sending')return;let stop=false;const run=async()=>{while(!stop){try{const j=await api({op:'step',id:c.id});setC(x=>({...x,sent:j.sent,failed:j.failed??x.failed,total:j.total,status:j.done?'sent':'sending'}));if(j.done)break;}catch{await new Promise(r=>setTimeout(r,4000));}await new Promise(r=>setTimeout(r,800));}};run();return ()=>{stop=true;};},[c.status,c.id]);
 const found=useMemo(()=>q.length<2?[]:products.filter(p=>p.title.toLowerCase().includes(q.toLowerCase())).slice(0,8),[q,products]);
 const test=async()=>{setBusy('test');setMsg(null);try{await api({op:'save',id:c.id,campaign:c});const j=await api({op:'test',id:c.id,campaign:c});setMsg(['Test sent to '+j.to+'. Check your inbox.','ok']);}catch(e){setMsg([(e as Error).message,'error']);}setBusy('');};
 const send=async()=>{if(!confirm(`Send “${c.subject}” to ${count?.toLocaleString('en-GB')} subscribers now? This can’t be undone.`))return;setBusy('send');setMsg(null);
  try{await api({op:'save',id:c.id,campaign:c});const j=await api({op:'start',id:c.id});setC(x=>({...x,status:'sending',total:j.total,sent:0}));}catch(e){setMsg([(e as Error).message,'error']);}setBusy('');};
 const del=async()=>{if(!confirm('Delete this email?'))return;try{await api({op:'delete',id:c.id});location.href='/admin/email';}catch(e){setMsg([(e as Error).message,'error']);}};
 return <div className="em">
  <div className="em-edit">
   {msg&&<p className={'adm-notice '+(msg[1]==='error'?'is-error':'is-ok')} role="status">{msg[0]}</p>}
   {c.status!=='draft'&&<section className="adm-card em-progress"><h2>{c.status==='sending'?'Sending…':'Sent'}</h2><div className="em-bar"><i style={{width:((c.sent||0)/Math.max(1,c.total||1)*100)+'%'}}/></div><p>{(c.sent||0).toLocaleString('en-GB')} of {(c.total||0).toLocaleString('en-GB')} delivered to Resend{c.failed?' · '+c.failed+' failed':''}.{c.status==='sending'?' Keep this page open until it finishes.':''}</p><NewEmailButton from={c.id} label="Duplicate as new email"/></section>}
   <section className="adm-card"><div className="auth-form compact">
    <label>Internal name<input value={c.name} disabled={locked} onChange={e=>set({name:e.target.value})}/></label>
    <label>Subject line<input value={c.subject} disabled={locked} maxLength={150} placeholder="e.g. Black Friday: 25% off lasting greenery" onChange={e=>set({subject:e.target.value})}/></label>
    <label>Preview text <span>shown after the subject in the inbox</span><input value={c.preheader} disabled={locked} maxLength={200} placeholder="Our biggest offer of the year, this weekend only." onChange={e=>set({preheader:e.target.value})}/></label>
   </div></section>
   {c.blocks.map((b,i)=><section key={i} className="adm-card em-block"><header><b>{LABEL[b.t]}</b>{!locked&&<span><button type="button" onClick={()=>move(i,-1)} aria-label="Move up">↑</button><button type="button" onClick={()=>move(i,1)} aria-label="Move down">↓</button><button type="button" onClick={()=>set({blocks:c.blocks.filter((_,k)=>k!==i)})} aria-label="Remove block">×</button></span>}</header>
    <fieldset disabled={locked} className="auth-form compact">
     {(b.t==='hero'||b.t==='image')&&<ImageField key={'img'+i} name={'img'+i} label="Photo" defaultValue={b.img} jpeg onChange={url=>setBlock(i,{img:url})} hint="Landscape photos work best. Saved as JPG so they show in every inbox."/>}
     {b.t==='hero'&&<><label>Headline<input value={b.title} onChange={e=>setBlock(i,{title:e.target.value})}/></label><label>Intro<textarea rows={2} value={b.text} onChange={e=>setBlock(i,{text:e.target.value})}/></label></>}
     {b.t==='heading'&&<label>Heading<input value={b.text} onChange={e=>setBlock(i,{text:e.target.value})}/></label>}
     {b.t==='text'&&<label>Text <span>leave a blank line between paragraphs</span><textarea rows={6} value={b.text} onChange={e=>setBlock(i,{text:e.target.value})}/></label>}
     {b.t==='button'&&<><label>Button text<input value={b.label} onChange={e=>setBlock(i,{label:e.target.value})}/></label><label>Link <span>e.g. /collections/artificial-olive-trees</span><input value={b.url} onChange={e=>setBlock(i,{url:e.target.value})}/></label></>}
     {b.t==='image'&&<><label>Description <span>for screen readers</span><input value={b.alt} onChange={e=>setBlock(i,{alt:e.target.value})}/></label><label>Link <span>optional</span><input value={b.url} onChange={e=>setBlock(i,{url:e.target.value})}/></label></>}
     {b.t==='offer'&&<><label>Code <span>create it under Discounts</span><input value={b.code} style={{textTransform:'uppercase'}} onChange={e=>setBlock(i,{code:e.target.value})}/></label><label>Offer text<input value={b.text} onChange={e=>setBlock(i,{text:e.target.value})}/></label></>}
     {b.t==='products'&&<div className="em-prods"><ul>{(b.handles as string[]).map(h=>{const p=products.find(x=>x.handle===h);return <li key={h}>{p&&<img src={p.img} alt=""/>}<span>{p?.title||h}</span><button type="button" onClick={()=>setBlock(i,{handles:b.handles.filter((x:string)=>x!==h)})}>Remove</button></li>;})}</ul>
      {b.handles.length<4&&<label>Add a product <span>up to 4</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search, e.g. olive"/></label>}
      {found.length>0&&<ul className="em-found">{found.map(p=><li key={p.handle}><button type="button" onClick={()=>{if(!b.handles.includes(p.handle))setBlock(i,{handles:[...b.handles,p.handle].slice(0,4)});setQ('');}}><img src={p.img} alt=""/>{p.title}</button></li>)}</ul>}</div>}
    </fieldset></section>)}
   {!locked&&<div className="em-add"><span>Add a block:</span>{Object.keys(NEW).map(t=><button key={t} type="button" className="adm-btn ghost" onClick={()=>set({blocks:[...c.blocks,{...NEW[t]}]})}>{LABEL[t]}</button>)}</div>}
   {!locked&&<section className="adm-card em-send"><h2>Send</h2>
    <p>{count===null?'Counting subscribers…':<><b>{count.toLocaleString('en-GB')}</b> people have agreed to marketing emails (newsletter subscribers, past customers who opted in and new-website customers who ticked the box). Anyone who unsubscribed is left out automatically.</>}</p>
    <div className="em-actions"><button type="button" className="adm-btn ghost" onClick={test} disabled={!!busy||!ready}>{busy==='test'?'Sending test…':'Send me a test ('+me+')'}</button>
     {canSend?<button type="button" className="pill" onClick={send} disabled={!!busy||!ready||!c.subject||!count}>{busy==='send'?'Starting…':'Send to '+(count??'…').toLocaleString()+' subscribers'} <span>↗</span></button>:<span className="adm-muted">The owner or an admin sends emails.</span>}</div>
    {!ready&&<p className="adm-muted">Sending switches on once Resend is connected.</p>}
    <button type="button" className="adm-clear em-del" onClick={del}>Delete this email</button></section>}
   <p className="adm-muted em-saved">{locked?'':dirty?'Saving…':'All changes saved'}</p>
  </div>
  <div className="em-preview"><div className="em-preview-bar"><b>Preview</b><span><button type="button" aria-pressed={!mobile} onClick={()=>setMobile(false)}>Desktop</button><button type="button" aria-pressed={mobile} onClick={()=>setMobile(true)}>Mobile</button></span></div>
   <div className="em-inbox"><b>{c.subject||'Subject line'}</b><span>{c.preheader}</span></div>
   <iframe title="Email preview" sandbox="" srcDoc={html} className={mobile?'is-mobile':''}/></div>
 </div>;
}
