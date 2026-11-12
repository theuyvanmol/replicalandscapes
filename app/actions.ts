"use server";
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {connected,graphql,cartFields,getCart} from '@/lib/shopify';
function quantity(value:FormDataEntryValue|null){const q=Number(value);if(!Number.isInteger(q)||q<1||q>99)throw new Error('Choose a quantity between 1 and 99.');return q;}
export async function addToCart(form:FormData){
 if(!connected)throw new Error('Connect Shopify before purchasing.');
 const merchandiseId=String(form.get('variant')||'');if(!merchandiseId.startsWith('gid://shopify/ProductVariant/'))throw new Error('Choose a valid variant.');
 const lines=[{merchandiseId,quantity:quantity(form.get('quantity'))}];const jar=await cookies();let id=jar.get('replica-cart')?.value;
 if(id&&!(await getCart(id)))id=undefined;
 const d:any=id?await graphql(`mutation($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,{cartId:id,lines}):await graphql(`mutation($input:CartInput!){cartCreate(input:$input){cart{${cartFields}} userErrors{message}}}`,{input:{lines}});
 const payload=d.cartLinesAdd||d.cartCreate;if(payload.userErrors.length)throw new Error(payload.userErrors.map((e:any)=>e.message).join(' '));
 jar.set('replica-cart',payload.cart.id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*10});revalidatePath('/cart');redirect('/cart');
}
export async function changeLine(form:FormData){
 const id=(await cookies()).get('replica-cart')?.value;if(!connected||!id)redirect('/cart');
 const line=String(form.get('line'));const q=Number(form.get('quantity'));if(!Number.isInteger(q)||q<0||q>99)throw new Error('Invalid quantity.');
 const d:any=q===0?await graphql(`mutation($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){userErrors{message}}}`,{cartId:id,lineIds:[line]}):await graphql(`mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){userErrors{message}}}`,{cartId:id,lines:[{id:line,quantity:q}]});
 const p=d.cartLinesRemove||d.cartLinesUpdate;if(p.userErrors.length)throw new Error(p.userErrors.map((e:any)=>e.message).join(' '));revalidatePath('/cart');
}
export async function checkout(){const id=(await cookies()).get('replica-cart')?.value;if(!connected||!id)redirect('/cart');const cart=await getCart(id);if(!cart?.totalQuantity)redirect('/cart');const url=new URL(cart.checkoutUrl);if(url.protocol!=='https:')throw new Error('Invalid checkout URL.');redirect(url.toString());}
