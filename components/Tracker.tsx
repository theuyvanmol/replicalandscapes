'use client';
import {usePathname} from 'next/navigation';import {useEffect} from 'react';
/* Counts page views and who is on the site right now. No cookies, nothing personal. */
function vid(){try{let v=sessionStorage.getItem('rl_v');if(!v){v=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(36).padStart(2,'0')).join('').slice(0,20);sessionStorage.setItem('rl_v',v);}return v;}catch{return '';}}
const send=(d:object)=>{try{const body=JSON.stringify(d);if(!navigator.sendBeacon?.('/api/t',new Blob([body],{type:'text/plain'})))fetch('/api/t',{method:'POST',body,keepalive:true});}catch{}};
export default function Tracker(){const path=usePathname();
 useEffect(()=>{if(!path||path.startsWith('/admin'))return;const v=vid();if(!v)return;
  let first=true;try{first=!sessionStorage.getItem('rl_seen');sessionStorage.setItem('rl_seen','1');}catch{}
  send({v,p:path,r:first?document.referrer:''});
  const t=setInterval(()=>{if(document.visibilityState==='visible')send({v,p:path,beat:1});},60000);return ()=>clearInterval(t);},[path]);
 return null;}
