import type {MetadataRoute} from 'next';import {products} from '@/lib/shopify';import {listPosts} from '@/lib/content';
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';const pages=['','/shop','/our-story','/bespoke-commercial','/blog'];const posts=await listPosts().catch(()=>[]);
 return [...pages.map(p=>({url:base+p})),...posts.map(p=>({url:base+'/blog/'+p.slug,lastModified:p.updated||p.date})),...(await products()).map(p=>({url:base+'/products/'+p.handle}))];}
