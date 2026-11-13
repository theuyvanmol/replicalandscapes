import 'server-only';
import {listPosts,ukFormat,smallImg} from '@/lib/content';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function journalBandHtml(){
 let posts;try{posts=(await listPosts()).slice(0,3);}catch{return '';}
 if(!posts.length)return '';
 const card=(p:typeof posts[number],i:number)=>`<article><a class="expertise-image" href="/blog/${esc(p.slug)}" aria-label="${esc(p.title)}">${p.cover?`<img src="${esc(smallImg(p.cover))}" alt="" loading="lazy" decoding="async">`:''}<span class="image-arrow" aria-hidden="true">↗</span><span class="image-caption">${esc(ukFormat(p.date,{day:'numeric',month:'long'}).toUpperCase())}</span></a><span class="editorial-number">0${i+1} / ${esc(p.category.toUpperCase())}</span><h3>${esc(p.title)}</h3>${p.excerpt?`<p>${esc(p.excerpt)}</p>`:''}<a class="text-link" href="/blog/${esc(p.slug)}">Read the story ↗</a></article>`;
 return `<section class="expertise-section journal-band wrap" aria-labelledby="jbTitle"><div class="expertise-heading"><p class="eyebrow">From the journal: ideas, care guides and recent projects</p><h2 id="jbTitle">Notes on<br>living green.</h2><a class="text-link" href="/blog">All stories ↗</a></div><div class="expertise-grid">${posts.map(card).join('')}</div></section>`;
}
