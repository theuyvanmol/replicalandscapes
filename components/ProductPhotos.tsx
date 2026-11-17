'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
type Media={id:string;alt:string;url:string|null;status:string};
/* Product photo manager: upload several at once, drag (or use arrows) to reorder, add a description, remove.
   The first photo is the main one shown in the shop. Photos are resized in the browser before uploading. */
async function prepare(f:File):Promise<string>{const img=await createImageBitmap(f);const max=2400,sc=Math.min(1,max/Math.max(img.width,img.height));
 const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);const g=c.getContext('2d')!;
 const png=f.type==='image/png';if(!png){g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);}g.drawImage(img,0,0,c.width,c.height);
 let q=.9,out=c.toDataURL(png?'image/png':'image/jpeg',q);while(!png&&out.length>3_600_000&&q>.5){q-=.1;out=c.toDataURL('image/jpeg',q);}
 if(png&&out.length>3_600_000)out=c.toDataURL('image/jpeg',.88);return out;}
export default function ProductPhotos({productId,title}:{productId:string;title:string}){
 const [media,setMedia]=useState<Media[]|null>(null);const [busy,setBusy]=useState('');const [err,setErr]=useState('');const [drag,setDrag]=useState<number|null>(null);const [over,setOver]=useState(false);
 const input=useRef<HTMLInputElement>(null);const base='/api/admin/products/'+productId+'/media';
 const load=useCallback(async()=>{const r=await fetch(base,{cache:'no-store'});const j=await r.json();if(r.ok)setMedia(j.media);else setErr(j.error||'Couldn’t load photos.');},[base]);
 useEffect(()=>{load();},[load]);
 useEffect(()=>{if(!media?.some(m=>!m.url||m.status!=='READY'))return;const t=setTimeout(load,3000);return ()=>clearTimeout(t);},[media,load]);
 const post=async(body:object)=>{const r=await fetch(base,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Something went wrong.');};
 const upload=async(files:FileList|File[])=>{const list=[...files].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type));if(!list.length){setErr('Choose JPG, PNG or WebP photos.');return;}setErr('');
  for(let i=0;i<list.length;i++){setBusy(`Uploading ${i+1} of ${list.length}…`);try{await post({op:'add',data:await prepare(list[i]),name:list[i].name,alt:title});}catch(e){setErr(list[i].name+': '+(e as Error).message);}}
  setBusy('');await load();};
 const remove=async(m:Media)=>{if(!confirm('Remove this photo from the product?'))return;setBusy('Removing…');try{await post({op:'delete',media:m.id});setMedia(x=>x?.filter(y=>y.id!==m.id)||null);}catch(e){setErr((e as Error).message);}setBusy('');};
 const reorder=async(next:Media[])=>{const prev=media;setMedia(next);setBusy('Saving order…');try{await post({op:'order',order:next.map(m=>m.id)});}catch(e){setErr((e as Error).message);setMedia(prev);}setBusy('');};
 const move=(i:number,d:number)=>{if(!media)return;const j=i+d;if(j<0||j>=media.length)return;const n=[...media];[n[i],n[j]]=[n[j],n[i]];reorder(n);};
 const alt=async(m:Media,v:string)=>{if(v===m.alt)return;setMedia(x=>x?.map(y=>y.id===m.id?{...y,alt:v}:y)||null);try{await post({op:'alt',media:m.id,alt:v});}catch(e){setErr((e as Error).message);}};
 return <section className="adm-card pp" onDragOver={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();setOver(true);}}} onDragLeave={()=>setOver(false)} onDrop={e=>{if(e.dataTransfer.files.length){e.preventDefault();setOver(false);upload(e.dataTransfer.files);}}}>
  <div className="pp-head"><h2>Photos</h2><span className="adm-muted">{busy||(media?media.length+(media.length===1?' photo':' photos'):'Loading…')}</span></div>
  {err&&<p className="adm-notice is-error" role="alert">{err}</p>}
  <ol className={'pp-grid'+(over?' is-over':'')}>
   {media?.map((m,i)=><li key={m.id} draggable onDragStart={()=>setDrag(i)} onDragOver={e=>{if(drag!==null){e.preventDefault();}}} onDrop={e=>{if(drag===null||drag===i)return;e.preventDefault();const n=[...media];const [x]=n.splice(drag,1);n.splice(i,0,x);setDrag(null);reorder(n);}} onDragEnd={()=>setDrag(null)} className={drag===i?'is-drag':''}>
    <div className="pp-img">{m.url?<img src={m.url+(m.url.includes('?')?'&':'?')+'width=360'} alt={m.alt}/>:<span>Processing…</span>}{i===0&&<em>Main photo</em>}</div>
    <input className="pp-alt" defaultValue={m.alt} placeholder="Describe the photo" aria-label="Photo description" onBlur={e=>alt(m,e.target.value)}/>
    <div className="pp-tools"><button type="button" onClick={()=>move(i,-1)} disabled={i===0||!!busy} aria-label="Move earlier">←</button><button type="button" onClick={()=>move(i,1)} disabled={i===media.length-1||!!busy} aria-label="Move later">→</button><button type="button" className="pp-del" onClick={()=>remove(m)} disabled={!!busy}>Remove</button></div>
   </li>)}
   <li className="pp-add"><button type="button" onClick={()=>input.current?.click()} disabled={!!busy}><b>+</b><span>Add photos</span><small>or drop them here</small></button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e=>{if(e.target.files)upload(e.target.files);e.target.value='';}}/></li>
  </ol>
  <p className="auth-hint">The first photo is the main one in the shop. Drag photos or use the arrows to change the order. Changes save to Shopify straight away and show on the website within about two minutes.</p>
 </section>;}
