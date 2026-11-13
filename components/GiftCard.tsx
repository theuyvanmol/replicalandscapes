"use client";
import {useEffect,useRef,useState} from 'react';
const AMOUNTS=[25,50,75,100,150,250];
const FINISHES=[['champagne','Champagne gold'],['forest','Forest & gold'],['noir','Noir & gold']] as const;
type Finish=typeof FINISHES[number][0];
function useCount(target:number){const [v,setV]=useState(target);const from=useRef(target);useEffect(()=>{const a=from.current,b=target;if(a===b)return;const t0=performance.now(),D=700;let raf=0;const step=(t:number)=>{const p=Math.min(1,(t-t0)/D);const e=1-Math.pow(1-p,3);setV(Math.round(a+(b-a)*e));if(p<1)raf=requestAnimationFrame(step);else from.current=b;};raf=requestAnimationFrame(step);return()=>{cancelAnimationFrame(raf);from.current=b;};},[target]);return v;}
export default function GiftCard(){
 const [amount,setAmount]=useState(100),[custom,setCustom]=useState(''),[finish,setFinish]=useState<Finish>('champagne'),[to,setTo]=useState(''),[from,setFrom]=useState(''),[msg,setMsg]=useState(''),[email,setEmail]=useState(''),[date,setDate]=useState(''),[flip,setFlip]=useState(false),[pulse,setPulse]=useState(0),[note,setNote]=useState('');
 const shown=useCount(amount);const card=useRef<HTMLDivElement>(null);
 const pick=(n:number)=>{setAmount(n);setCustom('');setPulse(p=>p+1);setFlip(false);};
 useEffect(()=>{const el=card.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.setProperty('--rx',((.5-y)*14).toFixed(2)+'deg');el.style.setProperty('--ry',((x-.5)*18).toFixed(2)+'deg');el.style.setProperty('--mx',(x*100).toFixed(1)+'%');el.style.setProperty('--my',(y*100).toFixed(1)+'%');};
  const leave=()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');el.style.setProperty('--mx','50%');el.style.setProperty('--my','30%');};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);return()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);};},[]);
 const today=new Date().toISOString().slice(0,10);
 return <div className="gc">
  <div className="gc-stage">
   <div ref={card} className={'gc-card fin-'+finish+(flip?' is-flipped':'')} onClick={()=>setFlip(f=>!f)} role="img" aria-label={`Replica Landscapes gift card for £${amount}${to?' to '+to:''}`}>
    <div className="gc-face gc-front">
     <span className="gc-sheen" aria-hidden="true"/><span className="gc-grain" aria-hidden="true"/>
     <div className="gc-top"><span className="gc-brand">Replica<br/>Landscapes</span><svg className="gc-leaf" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44V20M24 26c-8-1-13-7-13-16 9 0 14 6 13 16Zm0-4c7-1 12-6 12-14-8 0-12 5-12 14Z"/></svg></div>
     <div className="gc-mid"><small>Gift card</small><b key={pulse} className="gc-amount">£{shown.toLocaleString('en-GB')}</b></div>
     <div className="gc-bottom"><span>{to?<>For <em>{to}</em></>:'Lifelike planting. Lasting impressions.'}</span><span className="gc-chip" aria-hidden="true"/></div>
    </div>
    <div className="gc-face gc-back">
     <span className="gc-sheen" aria-hidden="true"/>
     <p className="gc-msg-to">{to?'Dear '+to+',':'A little something,'}</p>
     <p className="gc-msg">{msg||'Your message will appear here, written just as you type it.'}</p>
     <p className="gc-msg-from">{from?'With love, '+from:'With love'}</p>
     <span className="gc-back-foot">replicalandscapes.co.uk · Valid for 2 years</span>
    </div>
   </div>
   <p className="gc-hint"><span className="gc-cap">YOUR GIFT CARD, PREVIEWED LIVE</span>{flip?'Tap the card to see the front':'Tap the card to read your message'}</p>
  </div>
  <form className="gc-form" onSubmit={e=>{e.preventDefault();setNote('Thank you. Gift cards go on sale when the new shop opens, very soon. Your design is ready to go.');}}>
   <fieldset><legend><span>01 /</span>Choose an amount</legend>
    <div className="gc-amounts">{AMOUNTS.map(n=><button type="button" key={n} aria-pressed={amount===n&&!custom} onClick={()=>pick(n)}>£{n}</button>)}</div>
    <label className="gc-custom"><span>Or your own amount</span><span className="gc-pound">£<input inputMode="numeric" placeholder="10 – 1,000" value={custom} onChange={e=>{const v=e.target.value.replace(/\D/g,'').slice(0,4);setCustom(v);const n=Number(v);if(n>=10&&n<=1000){setAmount(n);setPulse(p=>p+1);}}}/></span></label>
   </fieldset>
   <fieldset><legend><span>02 /</span>Choose a finish</legend>
    <div className="gc-finishes">{FINISHES.map(([k,l])=><label key={k} className={'sw-'+k}><input type="radio" name="finish" checked={finish===k} onChange={()=>{setFinish(k);setFlip(false);}}/><i/>{l}</label>)}</div>
   </fieldset>
   <fieldset><legend><span>03 /</span>Make it personal</legend>
    <div className="gc-row"><label>To<input value={to} maxLength={24} onChange={e=>setTo(e.target.value)} placeholder="Their name"/></label><label>From<input value={from} maxLength={24} onChange={e=>setFrom(e.target.value)} placeholder="Your name"/></label></div>
    <label>Message<textarea value={msg} maxLength={180} rows={3} onFocus={()=>setFlip(true)} onChange={e=>setMsg(e.target.value)} placeholder="Happy housewarming. Something green that never needs watering."/><small className="gc-left">{180-msg.length} characters left</small></label>
    <div className="gc-row"><label>Their email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>Send on<input type="date" min={today} value={date} onChange={e=>setDate(e.target.value)}/></label></div>
   </fieldset>
   <div className="gc-total"><span>Total</span><b>£{amount.toLocaleString('en-GB')}.00</b></div>
   <button className="pill gc-buy">Add gift card to basket <span aria-hidden="true">↗</span></button>
   {note&&<p className="gc-note" role="status">{note}</p>}
   <p className="gc-small">Delivered by email on the date you choose. Spend online on trees, plants, flowers and planters. Valid for 2 years.</p>
  </form>
 </div>;
}
