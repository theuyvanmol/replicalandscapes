import 'server-only';
import {connected,graphql,products,productFields,mapProduct,type Product} from '@/lib/shopify';
import {kv,kvReady} from '@/lib/kv';
import {fmtHeight} from '@/lib/facets';
/* Products for the homepage Best Sellers, New Arrivals and hero "+" panels.
   Order of preference: Shopify collections (best-sellers, new-arrivals) → picks made in the admin area → the original design's selection. */
export const DEFAULT_BEST=['artificial-olive-tree-150cm-210cm','artificial-potted-boston-fern-60cm','artificial-eucalyptus-tree-180cm','pure-beige-footed-planter'];
export const DEFAULT_ARRIVALS=['natural-trunk-artificial-eucalyptus-tree-180cm','artificial-olive-tree-natural-multi-trunk-2-size-options','natural-multi-trunk-black-olive-200cm','natural-trunk-artificial-orange-tree'];
export const HERO={olive:'artificial-olive-tree-150cm-210cm',fern:'artificial-potted-boston-fern-60cm',planter:'pure-beige-footed-planter'};
export type HomeCard={handle:string;name:string;category:string;price:number|null;from:boolean;image:string;homeImage:string;cutout:boolean;spec:string;description:string;url:string;available:boolean;options:{label:string;id:string;available:boolean;price:number|null}[]};
export function toCard(p:Product):HomeCard{
 const prices=p.variants.map(v=>Number(v.price?.amount)).filter(n=>Number.isFinite(n)&&n>0);const min=prices.length?Math.min(...prices):p.price===null?null:Number(p.price);
 const hs=p.facets?.heights||[];const many=p.variants.length>1;
 const spec=[hs.length?(hs.length>1?fmtHeight(hs[0])+' – '+fmtHeight(hs[hs.length-1]):fmtHeight(hs[0])):'',many?p.variants.length+' sizes':'',p.facets?.outdoor?'Indoor & outdoor':''].filter(Boolean).join(' · ')||p.category;
 const imgs=p.images||[];
 return {handle:p.handle,name:p.title,category:p.category,price:min&&min>0?min:null,from:many&&new Set(prices).size>1,image:imgs[0]?.url||'',homeImage:(imgs[1]||imgs[0])?.url||'',cutout:!!(imgs[0] as {cutout?:boolean})?.cutout||!connected,spec,
  description:(p.description||'').replace(/\s+/g,' ').trim().slice(0,320),url:'/products/'+p.handle,available:p.variants.some(v=>v.availableForSale!==false),
  options:p.variants.map(v=>({label:/^(default title|standard|as shown)$/i.test(v.title)?'As shown':v.title,id:v.id,available:v.availableForSale!==false,price:Number(v.price?.amount)||null}))};}
async function collection(handle:string,n:number):Promise<Product[]>{
 const d:any=await graphql(`query($h:String!,$n:Int!){collection(handle:$h){products(first:$n){nodes{${productFields}}}}}`,{h:handle,n});
 return (d.collection?.products?.nodes||[]).map(mapProduct);}
export async function getPicks():Promise<{best:string[];arrivals:string[]}>{
 if(!kvReady)return {best:DEFAULT_BEST,arrivals:DEFAULT_ARRIVALS};
 const [b,a]=await Promise.all([kv<string|null>('GET','home:best'),kv<string|null>('GET','home:arrivals')]);
 const parse=(s:string|null,d:string[])=>{try{const v=s?JSON.parse(s):null;return Array.isArray(v)&&v.length?v as string[]:d;}catch{return d;}};
 return {best:parse(b,DEFAULT_BEST),arrivals:parse(a,DEFAULT_ARRIVALS)};}
export async function homeProducts(){
 let best:Product[]=[],arrivals:Product[]=[],source:'shopify'|'admin'='admin';
 const all=await products().catch(()=>[] as Product[]);const byHandle=new Map(all.map(p=>[p.handle,p]));
 if(connected){try{[best,arrivals]=await Promise.all([collection('best-sellers',8),collection('new-arrivals',8)]);if(best.length||arrivals.length)source='shopify';}catch{}}
 const picks=await getPicks().catch(()=>({best:DEFAULT_BEST,arrivals:DEFAULT_ARRIVALS}));
 if(!best.length)best=picks.best.map(h=>byHandle.get(h)).filter((p):p is Product=>!!p);
 if(!arrivals.length)arrivals=picks.arrivals.map(h=>byHandle.get(h)).filter((p):p is Product=>!!p);
 const hero=Object.fromEntries(Object.entries(HERO).map(([k,h])=>[k,byHandle.get(h)?toCard(byHandle.get(h)!):null]));
 return {connected,source,best:best.filter(p=>p.variants.some(v=>v.availableForSale!==false)).slice(0,8).map(toCard),arrivals:arrivals.filter(p=>p.variants.some(v=>v.availableForSale!==false)).slice(0,8).map(toCard),hero};}
