"use client";
import {useState} from 'react';
/* Team upload: photos are resized in the browser so they stay small; PDFs and documents upload as they are. */
async function shrink(file:File):Promise<File>{
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size<350*1024)return file;
 const img=await createImageBitmap(file);const s=Math.min(1,1800/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d')!.drawImage(img,0,0,c.width,c.height);
 for(const q of [.82,.72,.6]){const b:Blob=await new Promise(r=>c.toBlob(x=>r(x!),'image/webp',q));if(b.size<650*1024)return new File([b],file.name.replace(/\.\w+$/,'')+'.webp',{type:'image/webp'});}
 return file;}
export default function ProjectUploader({project}:{project:string}){
 const [busy,setBusy]=useState(false),[err,setErr]=useState('');
 return <form className="pf-up" onSubmit={async e=>{e.preventDefault();setErr('');const form=e.currentTarget;const fd=new FormData(form);const f=fd.get('file');if(!(f instanceof File)||!f.size){setErr('Choose a file first.');return;}
  setBusy(true);try{fd.set('file',await shrink(f));const r=await fetch(`/api/admin/projects/${project}/files`,{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(!r.ok){setErr(j.error||'Upload failed.');return;}location.hash='files';location.reload();}catch{setErr('Upload failed. Please try again.');}finally{setBusy(false);}}}>
  <label>File<input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.pptx" required/></label>
  <label>Name shown to the client<input name="name" placeholder="e.g. Ground floor planting proposal"/></label>
  <label>Type<select name="kind" defaultValue="proposal"><option value="proposal">Design proposal</option><option value="quote">Quote</option><option value="invoice">Invoice</option><option value="certificate">Certificate</option><option value="photo">Photo</option><option value="document">Document</option></select></label>
  <label className="auth-check"><input type="checkbox" name="approval"/> Ask the client to approve this</label>
  {err&&<p className="img-err">{err}</p>}
  <button className="adm-btn" disabled={busy}>{busy?'Uploading…':'Upload file'}</button>
  <p className="auth-hint">PDF, images, Word, Excel or PowerPoint up to 700KB. Photos are resized automatically.</p>
 </form>;}
