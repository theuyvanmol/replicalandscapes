import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
let cached:any[]|null=null;
function catalogue():any[]{if(!cached){const all=JSON.parse(fs.readFileSync(path.join(process.cwd(),'lib','catalogue.json'),'utf8')).products as any[];const keep=new Set<string>((JSON.parse(fs.readFileSync(path.join(process.cwd(),'lib','keep-list.json'),'utf8')).keep as number[]).map(String));cached=all.filter(p=>keep.has(String(p.id)));}return cached;}
import {facets,type Facets} from '@/lib/facets';
/* Shopify tags ("Outdoor", "Fire retardant") confirm or add to what the description says. */
const tagged=(f:Facets,tags:string[])=>{const t=tags.map(x=>x.toLowerCase());return {...f,outdoor:f.outdoor||t.includes('outdoor'),fr:f.fr||t.includes('fire retardant')};};
export {fields as productFields,map as mapProduct};
export type Product={facets?:Facets;id:string;handle:string;title:string;description:string;images:{url:string;altText:string|null;cutout?:boolean}[];price:string|null;currency:string;category:string;search?:string;variants:{id:string;title:string;availableForSale:boolean;price:{amount:string;currencyCode:string}}[]};
export const connected=Boolean(process.env.SHOPIFY_STORE_DOMAIN&&process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
export async function graphql<T>(query:string,variables:Record<string,unknown>={}):Promise<T>{
 const domain=process.env.SHOPIFY_STORE_DOMAIN!;
 if(!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(domain))throw new Error('Set a valid Shopify store domain.');
 const r=await fetch(`https://${domain}/api/${process.env.SHOPIFY_STOREFRONT_API_VERSION||'2026-10'}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!},body:JSON.stringify({query,variables}),cache:'no-store'});
 const data=await r.json();if(!r.ok||data.errors)throw new Error('Shopify request failed. Check store configuration.');return data.data;
}
const fields=`id handle title description productType tags availableForSale images(first:12){nodes{url altText}} priceRange{minVariantPrice{amount currencyCode}} variants(first:100){nodes{id title availableForSale price{amount currencyCode}}}`;
/* Shopify doesn't know which photos are transparent cut-outs; the imported catalogue does, so carry that over by handle. */
let cutouts:Set<string>|null=null;
function isCutout(handle:string){if(!cutouts){try{cutouts=new Set(catalogue().filter((c:any)=>c.images?.[0]?.cutout).map((c:any)=>c.handle));}catch{cutouts=new Set();}}return cutouts.has(handle);}
function map(p:any):Product{return {...p,category:p.productType,images:p.images.nodes.map((im:any,i:number)=>i===0&&isCutout(p.handle)?{...im,cutout:true}:im),variants:p.variants.nodes,price:p.priceRange.minVariantPrice.amount,currency:p.priceRange.minVariantPrice.currencyCode,facets:tagged(facets(p.title,p.description||'',p.variants.nodes.map((v:any)=>v.title)),p.tags||[])};}
export async function products():Promise<Product[]>{
 if(!connected)return catalogue().map((p:any)=>({id:'vs-'+p.id,handle:p.handle,title:p.title,description:p.description||'Full product details will follow when the Shopify catalogue is connected.',images:p.images.map((im:any)=>typeof im==='string'?{url:im,altText:p.title}:{url:im.url,altText:p.title,cutout:!!im.cutout}),price:p.price===null?null:String(p.price),currency:'GBP',category:p.category,search:p.search,variants:p.variants.map((v:any)=>({id:v.id,title:v.title,availableForSale:true,price:{amount:String(v.price??p.price??0),currencyCode:'GBP'}})),facets:facets(p.title,p.description||'',p.variants.map((v:any)=>v.title))}));
 let list:Product[]=[];let after:string|null=null;
 for(let page=0;page<50;page++){const data: any=await graphql(`query($after:String){products(first:100,after:$after){nodes{${fields}} pageInfo{hasNextPage endCursor}}}`,{after});list.push(...data.products.nodes.map(map));if(!data.products.pageInfo.hasNextPage)return list;after=data.products.pageInfo.endCursor;}
 throw new Error('Catalogue exceeded pagination limit. Increase the limit or use collection pagination.');
}
export async function product(handle:string):Promise<Product|null>{if(!connected)return (await products()).find(p=>p.handle===handle)||null;const d:any=await graphql(`query($handle:String!){product(handle:$handle){${fields}}}`,{handle});return d.product?map(d.product):null;}
export const cartFields=`id checkoutUrl totalQuantity cost{subtotalAmount{amount currencyCode} totalAmount{amount currencyCode}} lines(first:100){nodes{id quantity cost{totalAmount{amount currencyCode}} merchandise{... on ProductVariant{id title product{title handle featuredImage{url altText}}}}}}`;
export async function getCart(id:string){const d:any=await graphql(`query($id:ID!){cart(id:$id){${cartFields}}}`,{id});return d.cart;}
export function money(amount:string|null,currency='GBP'){return amount===null?'Price on request':new Intl.NumberFormat('en-GB',{style:'currency',currency}).format(Number(amount));}
