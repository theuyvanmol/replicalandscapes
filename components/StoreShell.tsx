import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
const header=fs.readFileSync(path.join(process.cwd(),'content','store-header.html'),'utf8');
/* The same footer as the homepage, with in-page links pointed back at the homepage. */
const home=fs.readFileSync(path.join(process.cwd(),'content','home.html'),'utf8');
const fStart=home.indexOf('<section class="contact wrap visual-contact">');
const siteFooter=fStart<0?'':home.slice(fStart,home.indexOf('</section>',fStart)+10).replace(/href="#/g,'href="/#');
export default function StoreShell({children}:{children:React.ReactNode}){return <div className="store-active">
 <div dangerouslySetInnerHTML={{__html:header}}/>
 <main className="store-wrap">{children}</main>
 <div className="site-footer" dangerouslySetInnerHTML={{__html:siteFooter}}/>
 <footer className="wrap"><span>© 2026 Replica Landscapes</span><span>Lifelike planting. Lasting impressions.</span><a href="#">Back to top ↑</a></footer>
 <Script src="/design/shop-menu.js" strategy="afterInteractive"/>
 <Script src="/design/store-header.js" strategy="afterInteractive"/>
 <Script src="/design/commerce-bridge.js" strategy="afterInteractive"/>
 <Script src="/design/reveal.js" strategy="afterInteractive"/>
</div>}
