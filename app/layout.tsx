import type { Metadata } from 'next';
import './storefront.css';
const origin=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {metadataBase:new URL(origin),title:{default:'Replica Landscapes | Artificial Plants & Bespoke Planting',template:'%s | Replica Landscapes'},description:'Lifelike artificial trees, plants and bespoke commercial planting. Discover considered greenery for homes, hospitality and workplaces.',robots:{index:process.env.ALLOW_INDEXING==='true'&&process.env.VERCEL_ENV!=='preview',follow:true},openGraph:{images:['/assets/olive-scene.webp']}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><head>{['style','story','editorial','shop','shop-menu','commercial','commercial-motion','heritage'].map(f=><link key={f} rel="stylesheet" href={'/design/'+f+'.css'}/>)}</head><body>{children}</body></html>}
