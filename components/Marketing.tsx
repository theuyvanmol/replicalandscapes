import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
import {products,connected,money} from '@/lib/shopify';
import {promoBandHtml} from '@/lib/promo-band';
import {journalBandHtml} from '@/lib/journal-band';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export default async function Marketing({ kind }: { kind: 'home' | 'story' | 'commercial' }) {
 let html=fs.readFileSync(path.join(process.cwd(),'content',kind+'.html'),'utf8');
 if(kind==='home'&&connected){const items=await products();const cards=(offset:number)=>items.slice(offset,offset+4).map(p=>`<article class="product"><a href="/products/${esc(p.handle)}"><img style="width:100%;height:300px;object-fit:contain;border-radius:40% 40% 12px 12px" src="${esc(p.images[0]?.url||'')}" alt="${esc(p.title)}" loading="lazy"><h3>${esc(p.title)}</h3><p>${esc(money(p.price,p.currency))}</p></a></article>`).join('');html=html.replace('<div id="productGrid" class="product-grid"></div>',`<div id="productGrid" class="product-grid">${cards(0)}</div>`).replace('<div class="arrivals" id="arrivals" tabindex="0" aria-label="New arrivals carousel"></div>',`<div class="arrivals" id="arrivals">${cards(4)}</div>`).replace(/<p class="price-note">[\s\S]*?<\/p>/,'');}
 if(kind==='home'){const band=await promoBandHtml();const count=(await products().catch(()=>[])).length;
  const paths=`<section class="home-paths wrap" aria-label="Where would you like to start?"><a class="path-card" href="/shop"><span class="path-img"><img src="/assets/olive-real.webp" alt="Artificial olive tree in a bright living room" loading="lazy" decoding="async"><span class="path-tag">FOR HOMES &amp; BUSINESSES</span></span><span class="editorial-number">01 / THE COLLECTION</span><b>Shop lifelike plants &amp; trees</b><span class="path-text">${count?count+' ':''}artificial trees, plants, flowers, hedging and planters, delivered free across the UK mainland on orders over £100.</span><span class="text-link">Browse the collection ↗</span></a><a class="path-card" href="/installation-service"><span class="path-img"><img src="/assets/hospitality-planting.webp" alt="Bespoke artificial planting in a restaurant" loading="lazy" decoding="async"><span class="path-tag">BESPOKE &amp; COMMERCIAL</span></span><span class="editorial-number">02 / DESIGN &amp; INSTALLATION</span><b>Plan a bespoke project</b><span class="path-text">Trees, hedging, living walls and ceilings designed, built and installed by our team for hotels, restaurants, offices and homes.</span><span class="text-link">Explore our installation service ↗</span></a></section>`;
  html=html.replace('<section class="intro wrap reveal">',paths+(band||'')+'<section class="intro wrap reveal">');
  const jb=await journalBandHtml();if(jb)html=html.replace('<section class="greenery-faq wrap visual-faq"',jb+'<section class="greenery-faq wrap visual-faq"');}
 return <><div dangerouslySetInnerHTML={{__html:html}} />
 <Script src={kind==='home'?'/design/app.js':'/design/story.js'} strategy="afterInteractive" />
 <Script src="/design/shop-menu.js" strategy="afterInteractive" />
 <Script src="/design/commercial-motion.js" strategy="afterInteractive" />
 <Script src="/design/intro.js" strategy="afterInteractive" />
 {kind==='home'&&<Script src="/design/promos.js" strategy="afterInteractive" />}
 <Script src="/design/vs-map.js" strategy="afterInteractive" />
 <Script src="/design/commerce-bridge.js" strategy="afterInteractive" /></>;
}
