import 'server-only';
import {listPosts,ukFormat} from '@/lib/content';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function journalBandHtml(){
 let posts;try{posts=(await listPosts()).slice(0,3);}catch{return '';}
 if(!posts.length)return '';
 const card=(p:typeof posts[number],i:number)=>`<a class="jb-card${i===0?' jb-lead':''}" href="/blog/${esc(p.slug)}"><span class="jb-img">${p.cover?`<img src="${esc(p.cover)}" alt="" loading="lazy">`:''}</span><span class="jb-copy"><small>${esc(p.category)} · ${esc(ukFormat(p.date,{day:'numeric',month:'long'}))}</small><b>${esc(p.title)}</b>${i===0&&p.excerpt?`<em>${esc(p.excerpt)}</em>`:''}<span class="jb-more">Read the story <i aria-hidden="true">↗</i></span></span></a>`;
 return `<section class="journal-band wrap reveal" aria-labelledby="jbTitle"><div class="jb-head"><div><p class="eyebrow">From the journal</p><h2 id="jbTitle">Ideas, guides <em>&amp; projects.</em></h2></div><a class="pill" href="/blog">All articles <span>↗</span></a></div><div class="jb-grid">${posts.map(card).join('')}</div></section>`;
}
