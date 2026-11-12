import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
import {products,connected,money} from '@/lib/shopify';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export default async function Marketing({ kind }: { kind: 'home' | 'story' | 'commercial' }) {
 let html=fs.readFileSync(path.join(process.cwd(),'content',kind+'.html'),'utf8');
 if(kind==='home'&&connected){const items=await products();const cards=(offset:number)=>items.slice(offset,offset+4).map(p=>`<article class="product"><a href="/products/${esc(p.handle)}"><img style="width:100%;height:300px;object-fit:contain;border-radius:40% 40% 12px 12px" src="${esc(p.images[0]?.url||'')}" alt="${esc(p.title)}" loading="lazy"><h3>${esc(p.title)}</h3><p>${esc(money(p.price,p.currency))}</p></a></article>`).join('');html=html.replace('<div id="productGrid" class="product-grid"></div>',`<div id="productGrid" class="product-grid">${cards(0)}</div>`).replace('<div class="arrivals" id="arrivals" tabindex="0" aria-label="New arrivals carousel"></div>',`<div class="arrivals" id="arrivals">${cards(4)}</div>`).replace(/<p class="price-note">[\s\S]*?<\/p>/,'');}
 return <><div dangerouslySetInnerHTML={{__html:html}} />
 <Script src={kind==='home'?'/design/app.js':'/design/story.js'} strategy="afterInteractive" />
 <Script src="/design/shop-menu.js" strategy="afterInteractive" />
 <Script src="/design/commercial-motion.js" strategy="afterInteractive" />
 <Script src="/design/commerce-bridge.js" strategy="afterInteractive" /></>;
}
