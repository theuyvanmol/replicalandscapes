import {cookies} from 'next/headers';
import {connected,graphql,cartFields,getCart} from '@/lib/shopify';
/* Used by the homepage product panels: add to the Shopify basket and read the basket count. */
const no={'Cache-Control':'no-store'};
export async function GET(){if(!connected)return Response.json({connected:false,count:0},{headers:no});
 const id=(await cookies()).get('replica-cart')?.value;if(!id)return Response.json({connected:true,count:0},{headers:no});
 const cart=await getCart(id).catch(()=>null);return Response.json({connected:true,count:cart?.totalQuantity||0},{headers:no});}
export async function POST(req:Request){
 if(!connected)return Response.json({error:'The shop is not connected yet.'},{status:503,headers:no});
 const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==new URL(req.url).host)return Response.json({error:'Bad origin'},{status:403,headers:no});
 const b=await req.json().catch(()=>({}));const merchandiseId=String(b.variant||'');const quantity=Number(b.quantity||1);
 if(!merchandiseId.startsWith('gid://shopify/ProductVariant/')||!Number.isInteger(quantity)||quantity<1||quantity>99)return Response.json({error:'Choose a size and quantity.'},{status:400,headers:no});
 const jar=await cookies();let id=jar.get('replica-cart')?.value;if(id&&!(await getCart(id).catch(()=>null)))id=undefined;
 const lines=[{merchandiseId,quantity}];
 const d:any=id?await graphql(`mutation($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,{cartId:id,lines}):await graphql(`mutation($input:CartInput!){cartCreate(input:$input){cart{${cartFields}} userErrors{message}}}`,{input:{lines}});
 const payload=d.cartLinesAdd||d.cartCreate;if(payload.userErrors?.length)return Response.json({error:payload.userErrors.map((e:any)=>e.message).join(' ')},{status:400,headers:no});
 jar.set('replica-cart',payload.cart.id,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*10});
 return Response.json({ok:true,count:payload.cart.totalQuantity},{headers:no});}
