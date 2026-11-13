import 'server-only';
import {products} from '@/lib/shopify';
export type PickProduct={handle:string;title:string;image:string;category:string;sizes:string[];outdoor:boolean};
export async function pickList():Promise<PickProduct[]>{return (await products().catch(()=>[])).map(p=>({handle:p.handle,title:p.title,image:p.images[0]?.url||'',category:p.category,sizes:p.facets?.sizes||[],outdoor:!!p.facets?.outdoor}));}
export async function findProduct(handle:string){return (await pickList()).find(p=>p.handle===handle)||null;}
