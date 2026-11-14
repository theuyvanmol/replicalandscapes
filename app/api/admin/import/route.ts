import {checkImportKey,importBatch} from '@/lib/legacy';
/* Receives data from the old Visualsoft admin (sent from the browser while signed in there).
   Needs the one-time key shown on Admin → Data import; only the two old shop domains may call it. */
const ORIGINS=['https://artificialplants.co.uk','https://www.artificialplants.co.uk','https://replicaplants.co.uk','https://www.replicaplants.co.uk'];
const cors=(o:string|null)=>({...(o&&ORIGINS.includes(o)?{'Access-Control-Allow-Origin':o,'Vary':'Origin'}:{}),'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, x-import-key','Access-Control-Max-Age':'600','Cache-Control':'no-store'});
export async function OPTIONS(req:Request){return new Response(null,{status:204,headers:cors(req.headers.get('origin'))});}
export async function POST(req:Request){
 const o=req.headers.get('origin');const h=cors(o);
 if(o&&!ORIGINS.includes(o)&&new URL(o).host!==new URL(req.url).host)return Response.json({error:'Origin not allowed'},{status:403,headers:h});
 if(!(await checkImportKey(req.headers.get('x-import-key')||'')))return Response.json({error:'Import key missing or expired. Create a new one in Admin → Data import.'},{status:401,headers:h});
 const len=Number(req.headers.get('content-length')||0);if(len>6_000_000)return Response.json({error:'Batch too large'},{status:413,headers:h});
 const body=await req.json().catch(()=>null);if(!body||!Array.isArray(body.items)||body.items.length>2000)return Response.json({error:'Send up to 2,000 items per batch'},{status:400,headers:h});
 try{const r=await importBatch(String(body.kind),body.items);return Response.json({ok:true,...r},{headers:h});}
 catch(e){return Response.json({error:(e as Error).message},{status:400,headers:h});}
}
