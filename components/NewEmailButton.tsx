'use client';
import {useState} from 'react';
export default function NewEmailButton({from,label='New email'}:{from?:string;label?:string}){const [busy,setBusy]=useState(false);
 return <button className="pill" disabled={busy} onClick={async()=>{setBusy(true);const r=await fetch('/api/admin/email',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({op:'new',from})});const j=await r.json();if(j.id)location.href='/admin/email/'+j.id;else{alert(j.error||'Could not create');setBusy(false);}}}>{busy?'Creating…':label} <span>+</span></button>;}
