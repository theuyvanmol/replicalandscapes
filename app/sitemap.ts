import type {MetadataRoute} from 'next';import {products} from '@/lib/shopify';import {listPosts} from '@/lib/content';import {GALLERY} from '@/lib/gallery';
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';const pages=['','/shop','/our-story','/bespoke-commercial','/installation-service','/gift-cards','/blog','/contact','/delivery-returns'];const posts=await listPosts().catch(()=>[]);
 return [...pages.map(p=>({url:base+p})),{url:base+'/gallery',images:GALLERY.map(g=>base+'/gallery/img/'+g.slug+'.webp')},...posts.map(p=>({url:base+'/blog/'+p.slug,lastModified:p.updated||p.date})),...(await products()).map(p=>({url:base+'/products/'+p.handle}))];}
