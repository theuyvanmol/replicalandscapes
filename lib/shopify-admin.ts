import 'server-only';
import {kv,kvReady} from '@/lib/kv';
/* Shopify Admin API for the owner's back office: orders, products, collections and discount codes.
   Uses a Dev Dashboard app (client credentials grant). Access tokens last 24 hours and are cached, then renewed automatically.
   A legacy admin token (SHOPIFY_ADMIN_TOKEN, starts shpat_) is also accepted. */
const VERSION=process.env.SHOPIFY_ADMIN_API_VERSION||'2026-10';
const shop=()=>(process.env.SHOPIFY_STORE_DOMAIN||'').replace(/^https?:\/\//,'').replace(/\/$/,'');
export const adminReady=Boolean(/^[a-z0-9-]+\.myshopify\.com$/i.test(shop())&&(process.env.SHOPIFY_ADMIN_TOKEN||(process.env.SHOPIFY_CLIENT_ID&&process.env.SHOPIFY_CLIENT_SECRET)));
let mem:{token:string;exp:number}|null=null;
async function token(force=false):Promise<string>{
 if(process.env.SHOPIFY_ADMIN_TOKEN)return process.env.SHOPIFY_ADMIN_TOKEN;
 if(!force&&mem&&mem.exp>Date.now()+60_000)return mem.token;
 if(!force&&kvReady){const c=await kv<string|null>('GET','shopify:admin-token').catch(()=>null);if(c){try{const v=JSON.parse(c);if(v.exp>Date.now()+60_000){mem=v;return v.token;}}catch{}}}
 const r=await fetch(`https://${shop()}/admin/oauth/access_token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:process.env.SHOPIFY_CLIENT_ID!,client_secret:process.env.SHOPIFY_CLIENT_SECRET!}),cache:'no-store'});
 const j=await r.json().catch(()=>({}));if(!r.ok||!j.access_token)throw new Error('Shopify admin connection failed ('+(j.error||r.status)+'). Check the app is installed and the Client ID/secret are correct.');
 mem={token:j.access_token,exp:Date.now()+(Number(j.expires_in)||86399)*1000};
 if(kvReady)await kv('SET','shopify:admin-token',JSON.stringify(mem),'EX',Math.max(60,(Number(j.expires_in)||86399)-120)).catch(()=>{});
 return mem.token;}
export class AdminError extends Error{}
export async function admin<T=any>(query:string,variables:Record<string,unknown>={},retry=true):Promise<T>{
 if(!adminReady)throw new AdminError('Shopify admin is not connected yet.');
 const r=await fetch(`https://${shop()}/admin/api/${VERSION}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':await token()},body:JSON.stringify({query,variables}),cache:'no-store'});
 if(r.status===401&&retry){mem=null;await token(true);return admin(query,variables,false);}
 const j=await r.json().catch(()=>({}));
 if(!r.ok||j.errors)throw new AdminError((j.errors&&(Array.isArray(j.errors)?j.errors.map((e:any)=>e.message).join(' '):String(j.errors)))||('Shopify error '+r.status));
 return j.data as T;}
export const userErrors=(p:any)=>{const e=p?.userErrors||[];if(e.length)throw new AdminError(e.map((x:any)=>x.message).join(' '));};
export const gidNum=(gid:string)=>gid.split('/').pop()||'';
export const money=(a:string|number|null|undefined,c='GBP')=>a===null||a===undefined||a===''?'–':new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).format(Number(a));
export const shopAdminUrl=(path:string)=>`https://admin.shopify.com/store/${shop().replace('.myshopify.com','')}/${path}`;
