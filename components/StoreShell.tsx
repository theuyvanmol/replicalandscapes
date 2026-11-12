import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
const header=fs.readFileSync(path.join(process.cwd(),'content','store-header.html'),'utf8');
export default function StoreShell({children}:{children:React.ReactNode}){return <div className="store-active">
 <div dangerouslySetInnerHTML={{__html:header}}/>
 <main className="store-wrap">{children}</main>
 <footer className="wrap"><span>© 2026 Replica Landscapes</span><span>Lifelike planting. Lasting impressions.</span><a href="#">Back to top ↑</a></footer>
 <Script src="/design/shop-menu.js" strategy="afterInteractive"/>
 <Script src="/design/store-header.js" strategy="afterInteractive"/>
 <Script src="/design/commerce-bridge.js" strategy="afterInteractive"/>
</div>}
