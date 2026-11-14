"use client";
import {useRef,useState} from 'react';
/** Pick a photo, shrink it in the browser, upload it, and keep its address in a hidden field. */
export default function ImageField({name,label,defaultValue='',hint,onChange,jpeg}:{name:string;label:string;defaultValue?:string;hint?:string;onChange?:(url:string)=>void;jpeg?:boolean}){
 const [url,setUrl]=useState(defaultValue),[busy,setBusy]=useState(''),[err,setErr]=useState('');const file=useRef<HTMLInputElement>(null);
 async function pick(f:File){setErr('');setBusy('Preparing photo…');
  try{const bmp=await createImageBitmap(f);const max=1600,scale=Math.min(1,max/Math.max(bmp.width,bmp.height));
   const c=document.createElement('canvas');c.width=Math.round(bmp.width*scale);c.height=Math.round(bmp.height*scale);c.getContext('2d')!.drawImage(bmp,0,0,c.width,c.height);
   let q=.82,data='';for(let i=0;i<5;i++){data=c.toDataURL(jpeg?'image/jpeg':'image/webp',q).split(',')[1];if(data.length<650_000)break;q-=.12;}
   setBusy('Uploading…');const r=await fetch('/api/admin/media',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:jpeg?'image/jpeg':'image/webp',data,name:f.name})});
   const j=await r.json();if(!r.ok)throw new Error(j.error||'Upload failed.');setUrl(j.url);onChange?.(j.url);}
  catch(e){setErr(e instanceof Error?e.message:'Upload failed. Try again.');}finally{setBusy('');if(file.current)file.current.value='';}}
 return <div className="img-field"><span className="img-label">{label}</span>
  <div className="img-box">{url?<img src={url} alt=""/>:<span className="img-empty">No image yet</span>}</div>
  <div className="img-actions"><button type="button" className="adm-btn" onClick={()=>file.current?.click()} disabled={!!busy}>{busy||(url?'Replace photo':'Upload photo')}</button>{url&&<button type="button" className="adm-clear" onClick={()=>{setUrl('');onChange?.('');}}>Remove</button>}</div>
  <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const f=e.target.files?.[0];if(f)pick(f);}}/>
  <input type="hidden" name={name} value={url}/>
  {hint&&<span className="auth-hint">{hint}</span>}{err&&<span className="img-err" role="alert">{err}</span>}
 </div>;
}
