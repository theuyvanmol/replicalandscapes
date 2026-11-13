/* Facts derived from a product's own title, size options and description, used for shop filters and product details. */
export type Facets={heights:number[];outdoor:boolean;fr:boolean;sizes:string[];features:string[]};
const toCm=(n:number,u:string)=>u==='m'?n*100:u==='mm'?n/10:/^f/.test(u)?n*30.48:n;
function heightOf(t:string):number|null{
 const s=t.toLowerCase();
 const hi=/(\d+(?:\.\d+)?)\s*(cm|mm|m|ft|foot|feet)\s*(?:high|tall|h\b|height)/.exec(s)||/(?:height|h)\s*:?\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|ft|foot|feet)\b/.exec(s);
 if(hi)return Math.round(toCm(parseFloat(hi[1]),hi[2]));
 if(/wide|long|diameter|dia\b|width|length/.test(s)&&!/high|tall/.test(s))return null;
 const any=/(\d+(?:\.\d+)?)\s*(cm|mm|m|ft|foot|feet)\b/.exec(s);
 return any?Math.round(toCm(parseFloat(any[1]),any[2])):null;
}
const OUT=/\buv[ -]?(resistant|protected|stabili[sz]ed|treated|rated|foliage)|\buv artificial|outdoor use|suitable for outdoors?|indoor\s*(&|and|or|\/)\s*outdoor|interior\s*(&|and|or)\s*exterior|exterior\s*(&|and|or)\s*interior|exterior grade|exterior use|external use|internal\s*(&|and)\s*external|outdoor plant|for outdoors/;
const NOT_OUT=/(not|unsuitable)[^.]{0,30}(outdoor|outside|external)|indoor use only|for indoor use only/;
const FR=/fire[ -]?(retardant|resistant|rated|proof)|flame[ -]?(retardant|resistant|proof)|\bifr\b/;
export function facets(title:string,description:string,variantTitles:string[]):Facets{
 const d=(title+' \n '+description).toLowerCase();
 const hs=[...variantTitles,title].map(heightOf).filter((h):h is number=>h!==null&&h>=5&&h<=2000);
 const heights=[...new Set(variantTitles.map(heightOf).filter((h):h is number=>h!==null&&h>=5&&h<=2000))];
 const outdoor=OUT.test(d)&&!NOT_OUT.test(d);const fr=FR.test(d);
 const sizes=variantTitles.filter(v=>!/^(standard|as shown|default title)$/i.test(v.trim()));
 const features=description.split(/\n+/).map(l=>l.trim()).filter(l=>/^[•\-*]/.test(l)).map(l=>l.replace(/^[•\-*]\s*/,'')).filter(l=>l.length>2&&l.length<90).slice(0,8);
 let hh=heights.length?heights:(hs.length?[hs[0]]:[]);
 if(!hh.length){const m=/(\d+(?:\.\d+)?)\s*(cm|m|ft)\s*(?:tall|high)/.exec(d);if(m){const v=Math.round(toCm(parseFloat(m[1]),m[2]));if(v>=5&&v<=2000)hh=[v];}}
 return {heights:hh.sort((a,b)=>a-b),outdoor,fr,sizes,features};
}
export const fmtHeight=(cm:number)=>cm>=100?`${(cm/100).toFixed(cm%100?1:0).replace(/\.0$/,'')}m`:`${Math.round(cm)}cm`;
