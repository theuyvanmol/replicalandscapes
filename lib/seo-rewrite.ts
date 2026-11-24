import {fixOldLinks} from '@/lib/old-links';
/* Rewrites product copy for the Replica Landscapes brand and the UK market:
   old company names -> Replica Landscapes, old-site links -> this site, US -> UK spelling,
   and a search title + description for every product. "Artificial" stays where it describes a product. */
const BRAND:[RegExp,string][]=[
 [/\b(?:https?:\/\/)?(?:www\.)?(?:replicaplants|artificialplants|theartificialplantsshop)\.co\.uk\b\/?/gi,'replicalandscapes.com'],
 [/\bReplica[\s-]?Plants(?:\s+(?:Ltd|Limited))?\b/gi,'Replica Landscapes'],
 [/\b(?:The\s+)?Artificial\s+Plants\s+(?:Shop|Ltd\.?|Limited|Company|Co\.)\b/gi,'Replica Landscapes'],
 [/\b(at|from|with|by|choose|contact|call|trust)\s+(?:the\s+)?Artificial\s+Plants\b(?!\s+(?:and|&|for|in|to|that|are|which|range|collection))/gi,'$1 Replica Landscapes'],
 [/\bArtificial\s+Plants(?:’|')s?\b(?=\s+(?:team|range|experts?|service|customers|showroom|own|warehouse))/gi,'Replica Landscapes’'],
 [/\bReplica Landscapes\s+Landscapes\b/g,'Replica Landscapes'],
];
const UK:[RegExp,string][]=[
 [/\bcolor(s|ed|ful|ing)?\b/g,'colour$1'],[/\bColor(s|ed|ful|ing)?\b/g,'Colour$1'],
 [/\bcenter(s|ed)?\b/g,'centre$1'],[/\bCenter(s|ed)?\b/g,'Centre$1'],[/\bcenterpiece(s)?\b/g,'centrepiece$1'],[/\bCenterpiece(s)?\b/g,'Centrepiece$1'],
 [/\bgray\b/g,'grey'],[/\bGray\b/g,'Grey'],[/\bfavorite(s)?\b/g,'favourite$1'],[/\bFavorite(s)?\b/g,'Favourite$1'],
 [/\bmeter(s)?\b/g,'metre$1'],[/\bcentimeter(s)?\b/g,'centimetre$1'],[/\bfiber(s|glass)?\b/g,'fibre$1'],[/\bFiber(s|glass)?\b/g,'Fibre$1'],
 [/\borganiz(e|ed|es|ing|ation)\b/g,'organis$1'],[/\bcustomiz(e|ed|es|ing|able)\b/g,'customis$1'],[/\brealiz(e|ed|es|ing)\b/g,'realis$1'],
 [/\bjewelry\b/g,'jewellery'],[/\bmold(s|ed)?\b/g,'mould$1'],[/\bdefense\b/g,'defence'],[/\bflavor(s)?\b/g,'flavour$1'],[/\bneighbor(s|hood|ing)?\b/g,'neighbour$1'],
 [/\bbehavior(s)?\b/g,'behaviour$1'],[/\bcatalog(s)?\b/g,'catalogue$1'],[/\bliter(s)?\b/g,'litre$1'],[/\bplow\b/g,'plough'],[/\bfaucet\b/g,'tap'],[/\bstore front\b/g,'shopfront'],
 [/\bvacation\b/g,'holiday'],[/\bapartment(s)?\b/g,'flat$1'],[/\bfall foliage\b/gi,'autumn foliage'],
];
const textOnly=(fn:(s:string)=>string)=>(html:string)=>html.replace(/(<[^>]*>)|([^<]+)/g,(m,tag,txt)=>tag?tag.replace(/(href|src)="([^"]*)"/g,(a,k,v)=>`${k}="${k==='href'?fixOldLinks(v):v}"`):fn(txt));
const apply=(s:string,rules:[RegExp,string][])=>rules.reduce((a,[r,w])=>a.replace(r,w),s);
export const brandText=(s:string)=>apply(apply(fixOldLinks(s||''),BRAND),UK);
export const rewriteHtml=textOnly(brandText);
const plain=(html:string)=>String(html||'').replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi,'. ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&[a-z]+;/g,' ').replace(/\s*\.\s*(\.\s*)+/g,'. ').replace(/\s+/g,' ').trim();
const cut=(s:string,n:number)=>{if(s.length<=n)return s;const c=s.slice(0,n-1);return c.slice(0,Math.max(c.lastIndexOf(' '),n*0.6)).replace(/[\s,;:–-]+$/,'')+'…';};
const tidyTitle=(t:string)=>t.replace(/\s+/g,' ').replace(/\s*[-–|]\s*$/,'').trim();
export function seoTitle(title:string){const t=tidyTitle(brandText(title));const full=`${t} | Replica Landscapes`;if(full.length<=60)return full;if(t.length<=60)return t;return cut(t,60);}
export function seoDescription(title:string,html:string,opts:{outdoor?:boolean;fire?:boolean;priceOnRequest?:boolean}={}){
 const t=tidyTitle(brandText(title));const body=plain(brandText(html));
 const first=(body.split(/(?<=[.!?])\s+/).find(s=>s.length>40&&!/^(dimensions|size|height|width|please|note|delivery|sku)/i.test(s))||'').replace(/\s+/g,' ');
 const perks=[opts.outdoor?'UV-protected for outdoor use':'lifelike and maintenance-free',opts.fire?'flame retardant':null].filter(Boolean).join(', ');
 const tail=` ${perks.charAt(0).toUpperCase()+perks.slice(1)}. ${opts.priceOnRequest?'Enquire for a price.':'Fast UK delivery.'}`;
 const lead=`${t} from Replica Landscapes.`;
 let d=lead+(first?' '+first:'');d=cut(d,155-tail.length)+tail;
 if(d.length>158)d=cut(lead+tail,158);return d.replace(/\s+/g,' ').trim();}
