import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
import {products,connected,money} from '@/lib/shopify';
import {promoBandHtml} from '@/lib/promo-band';
import {homeProducts} from '@/lib/home-products';
import {journalBandHtml} from '@/lib/journal-band';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export default async function Marketing({ kind }: { kind: 'home' | 'story' | 'commercial' }) {
 let html=fs.readFileSync(path.join(process.cwd(),'content',kind+'.html'),'utf8');
 if(kind==='home'){const data=await homeProducts().catch(()=>null);if(data){const json=JSON.stringify(data).replace(/</g,'\\u003c');html=html.replace('<div id="productGrid" class="product-grid"></div>','<script type="application/json" id="rl-home-data">'+json+'</script><div id="productGrid" class="product-grid"></div>');if(data.connected)html=html.replace(/<p class="price-note">[\s\S]*?<\/p>/,'<p class="price-note">Prices include VAT. Free UK mainland delivery on orders over £100.</p>');}}
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
