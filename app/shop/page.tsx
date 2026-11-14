import StoreShell from '@/components/StoreShell';import Catalogue from '@/components/Catalogue';import {products} from '@/lib/shopify';
export const revalidate=120;
export const metadata={title:'Shop Artificial Plants & Trees',alternates:{canonical:'/shop'}};
export default async function Shop({searchParams}:{searchParams:Promise<{category?:string;q?:string;type?:string}>}){const params=await searchParams;const items=(await products()).map(p=>({...p,description:((p.search||'')+' '+p.description).slice(0,400),variants:p.variants.map(v=>({...v,id:v.id}))}));return <StoreShell><Catalogue items={items} initialCategory={params.category} initialQuery={params.q} initialType={params.type}/></StoreShell>}
