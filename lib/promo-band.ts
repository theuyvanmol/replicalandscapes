import 'server-only';
import {homepagePromos,promoState,ukFormat,type Promo} from '@/lib/content';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const count=(to:string,label:string)=>`<div class="pb-count" data-to="${esc(to)}"><small class="pb-count-l">${label}</small><span><b data-u="d">00</b><small>Days</small></span><span><b data-u="h">00</b><small>Hours</small></span><span><b data-u="m">00</b><small>Minutes</small></span><span><b data-u="s">00</b><small>Seconds</small></span></div>`;
function when(p:Promo){const same=ukFormat(p.start,{day:'numeric',month:'short'})===ukFormat(p.end,{day:'numeric',month:'short'});
 return same?`${ukFormat(p.start,{weekday:'long',day:'numeric',month:'long'})} · ${ukFormat(p.start,{hour:'numeric',minute:'2-digit'})}–${ukFormat(p.end,{hour:'numeric',minute:'2-digit'})}`:`${ukFormat(p.start,{day:'numeric',month:'long'})} – ${ukFormat(p.end,{day:'numeric',month:'long'})}`;}
export async function promoBandHtml(){
 let list:Promo[]=[];try{list=await homepagePromos();}catch{return '';}
 if(!list.length)return '';
 const slides=list.map((p,i)=>{const st=promoState(p);const upcoming=st==='upcoming';
  const meta=p.kind==='event'?`<p class="pb-when"><span>${upcoming?'Coming up':'Happening now'}</span>${esc(when(p))}</p>${upcoming?count(p.start,'Starts in'):''}`:upcoming?`<p class="pb-when"><span>Coming soon</span>${esc(when(p))}</p>${count(p.start,'Starts in')}`:count(p.end,'Ends in');
  const ticker=p.ticker?p.ticker.split(',').map(s=>s.trim()).filter(Boolean):[];
  const track=ticker.length?`<div class="pb-ticker" aria-hidden="true"><div class="pb-track">${Array(4).fill(ticker.map(t=>`<span>${esc(t)}</span><i>✦</i>`).join('')).join('')}</div></div>`:'';
  return `<article class="pb-slide theme-${p.theme}${p.image?' has-img':''}${i===0?' is-active':''}" data-slide="${i}" aria-roledescription="slide" aria-label="${i+1} of ${list.length}: ${esc(p.title)}"${i?' aria-hidden="true"':''}>
${p.image?`<img class="pb-media" src="${esc(p.image)}" alt="" loading="${i?'lazy':'eager'}">`:''}
<div class="pb-inner"><div class="pb-copy">
<p class="eyebrow pb-eyebrow">${esc((p.eyebrow||(p.kind==='event'?'Event':'Offer')).toUpperCase())}${upcoming?' / COMING SOON':''}</p>
<h2 class="pb-title">${esc(p.title)}</h2>${p.text?`<p class="pb-text">${esc(p.text)}</p>`:''}
<div class="pb-meta">${meta}</div>
<div class="pb-actions">${p.code?`<button type="button" class="pb-code" data-code="${esc(p.code)}"><small>Use code</small> <b>${esc(p.code)}</b> <span>Copy</span></button>`:''}${p.ctaLabel&&p.ctaLink?`<a class="pill pb-cta" href="${esc(p.ctaLink)}">${esc(p.ctaLabel)} <span aria-hidden="true">↗</span></a>`:''}</div>
</div>${p.badge?`<div class="pb-visual"><span class="pb-seal"><b>${esc(p.badge)}</b><span>${esc((p.eyebrow||'Offer').toUpperCase())}</span></span></div>`:''}</div>${track}</article>`;}).join('');
 const nav=list.length>1?`<div class="pb-nav" role="group" aria-label="Choose offer">${list.map((p,i)=>`<button type="button" class="pb-pip${i===0?' is-active':''}" data-go="${i}" aria-label="Show ${esc(p.title)}"><i></i></button>`).join('')}</div>`:'';
 return `<section class="promo-band wrap" id="offers" aria-roledescription="carousel" aria-label="Current offers and events"><div class="pb-slides">${slides}</div>${nav}</section>`;
}
