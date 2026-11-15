import map from '@/lib/old-products.json';
/* Product descriptions brought over from Visualsoft sometimes link to the old websites.
   Swap those for the matching page on this site (product pages by their old -p number). */
const OLD=/https?:\/\/(?:www\.)?(?:artificialplants|replicaplants|theartificialplantsshop)\.co\.uk(\/[^\s"'<>)]*)?/gi;
export function fixOldLinks(text:string){if(!text)return text;return text.replace(OLD,(_m,path='')=>{const p=String(path).match(/-p(\d+)\/?$/);const h=p&&(map as Record<string,string>)[p[1]];return h?'/products/'+h:'/shop';});}
