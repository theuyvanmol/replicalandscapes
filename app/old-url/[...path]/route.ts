import map from '@/lib/old-products.json';
/* Old Visualsoft web addresses (artificialplants.co.uk / replicaplants.co.uk) → the new pages, permanently,
   so Google rankings and old links carry over. Products end in -p{number}; categories in -c{number}. */
const products=map as Record<string,string>;
export async function GET(req:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;const last=(path[path.length-1]||'').toLowerCase();const base=new URL(req.url).origin;
 const p=last.match(/-p(\d+)$/);if(p&&products[p[1]])return Response.redirect(base+'/products/'+products[p[1]],308);
 const c=last.match(/^(.*)-c\d+$/);if(c){const words=c[1].replace(/^(artificial|replica)-/,'').replace(/-and-|-/g,' ').trim();return Response.redirect(base+'/shop?q='+encodeURIComponent(words),308);}
 return Response.redirect(base+'/shop',308);
}
