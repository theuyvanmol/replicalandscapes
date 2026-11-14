import 'server-only';
import {admin,userErrors,AdminError} from '@/lib/shopify-admin';
const M='shopMoney{amount currencyCode}';
/* ---------- Orders ---------- */
export type OrderRow={id:string;name:string;createdAt:string;financial:string;fulfillment:string;total:string;currency:string;customer:string;email:string;items:string;cancelled:boolean};
export async function listOrders(filter:'open'|'all'|'unfulfilled'='unfulfilled',search='',after?:string){
 const q=[filter==='unfulfilled'?'fulfillment_status:unfulfilled -status:cancelled':filter==='open'?'status:open':'',search].filter(Boolean).join(' ');
 const d=await admin(`query($q:String,$after:String){orders(first:40,after:$after,sortKey:CREATED_AT,reverse:true,query:$q){pageInfo{hasNextPage endCursor} nodes{id name createdAt cancelledAt displayFinancialStatus displayFulfillmentStatus email totalPriceSet{${M}} customer{displayName} lineItems(first:4){nodes{title quantity}}}}}`,{q:q||null,after:after||null});
 return {rows:d.orders.nodes.map((o:any):OrderRow=>({id:o.id,name:o.name,createdAt:o.createdAt,financial:o.displayFinancialStatus,fulfillment:o.displayFulfillmentStatus,total:o.totalPriceSet.shopMoney.amount,currency:o.totalPriceSet.shopMoney.currencyCode,customer:o.customer?.displayName||o.email||'Guest',email:o.email||'',items:o.lineItems.nodes.map((l:any)=>`${l.quantity} × ${l.title}`).join(', '),cancelled:!!o.cancelledAt})),next:d.orders.pageInfo.hasNextPage?d.orders.pageInfo.endCursor:null};}
export async function getOrder(id:string){
 const d=await admin(`query($id:ID!){order(id:$id){id name createdAt cancelledAt note email phone displayFinancialStatus displayFulfillmentStatus
  totalPriceSet{${M}} subtotalPriceSet{${M}} totalShippingPriceSet{${M}} totalTaxSet{${M}} totalDiscountsSet{${M}} discountCodes
  customer{displayName email phone numberOfOrders} shippingAddress{name company address1 address2 city province zip country phone}
  lineItems(first:100){nodes{id title variantTitle quantity sku image{url} originalUnitPriceSet{${M}} product{handle}}}
  fulfillments{createdAt status trackingInfo{number url company}}
  fulfillmentOrders(first:10){nodes{id status lineItems(first:100){nodes{id remainingQuantity}}}}}}`,{id});
 return d.order;}
export async function fulfilOrder(orderId:string,tracking:{number:string;company:string;url:string},notify:boolean){
 const o=await getOrder(orderId);if(!o)throw new AdminError('Order not found.');
 const open=o.fulfillmentOrders.nodes.filter((f:any)=>['OPEN','IN_PROGRESS','SCHEDULED'].includes(f.status)&&f.lineItems.nodes.some((l:any)=>l.remainingQuantity>0));
 if(!open.length)throw new AdminError('Nothing left to fulfil on this order.');
 const fulfillment:any={lineItemsByFulfillmentOrder:open.map((f:any)=>({fulfillmentOrderId:f.id})),notifyCustomer:notify};
 if(tracking.number)fulfillment.trackingInfo={number:tracking.number,company:tracking.company||'FedEx',...(tracking.url?{url:tracking.url}:{})};
 const d=await admin(`mutation($f:FulfillmentInput!){fulfillmentCreate(fulfillment:$f){fulfillment{id status} userErrors{field message}}}`,{f:fulfillment});userErrors(d.fulfillmentCreate);}
export async function setOrderNote(id:string,note:string){const d=await admin(`mutation($input:OrderInput!){orderUpdate(input:$input){order{id} userErrors{field message}}}`,{input:{id,note}});userErrors(d.orderUpdate);}
export async function ordersForEmail(email:string){
 const d=await admin(`query($q:String!){orders(first:20,sortKey:CREATED_AT,reverse:true,query:$q){nodes{id name createdAt cancelledAt displayFinancialStatus displayFulfillmentStatus totalPriceSet{${M}} lineItems(first:20){nodes{title variantTitle quantity image{url} product{handle}}} fulfillments{trackingInfo{number url company}}}}}`,{q:`email:"${email.replace(/"/g,'')}"`});
 return d.orders.nodes as any[];}
/* ---------- Sales summary ---------- */
export async function salesSummary(){
 const since=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
 const d=await admin(`query($q:String!){orders(first:250,sortKey:CREATED_AT,reverse:true,query:$q){nodes{createdAt cancelledAt totalPriceSet{${M}}}} open:ordersCount(query:"fulfillment_status:unfulfilled -status:cancelled"){count}}`,{q:`created_at:>=${since}`});
 const now=Date.now(),day=864e5;const rows=d.orders.nodes.filter((o:any)=>!o.cancelledAt);
 const sum=(ms:number)=>rows.filter((o:any)=>now-Date.parse(o.createdAt)<ms).reduce((a:any,o:any)=>({n:a.n+1,t:a.t+Number(o.totalPriceSet.shopMoney.amount)}),{n:0,t:0});
 return {today:sum(day),week:sum(7*day),month:sum(30*day),toFulfil:d.open?.count??0};}
/* ---------- Products ---------- */
export async function listAdminProducts(search='',after?:string){
 const d=await admin(`query($q:String,$after:String){products(first:40,after:$after,sortKey:TITLE,query:$q){pageInfo{hasNextPage endCursor} nodes{id title handle status productType tags totalInventory featuredMedia{preview{image{url}}} priceRangeV2{minVariantPrice{amount} maxVariantPrice{amount}} variantsCount{count}}}}`,{q:search||null,after:after||null});
 return {rows:d.products.nodes as any[],next:d.products.pageInfo.hasNextPage?d.products.pageInfo.endCursor:null};}
export async function getAdminProduct(id:string){
 const d=await admin(`query($id:ID!){product(id:$id){id title handle status descriptionHtml productType tags onlineStorePreviewUrl seo{title description} featuredMedia{preview{image{url}}} media(first:10){nodes{preview{image{url}}}} variants(first:100){nodes{id title price compareAtPrice sku}}}}`,{id});return d.product;}
export async function updateAdminProduct(id:string,p:{title:string;descriptionHtml:string;status:string;tags:string[];productType:string;seoTitle:string;seoDescription:string},variants:{id:string;price:string;compareAtPrice:string|null}[]){
 const d=await admin(`mutation($product:ProductUpdateInput!){productUpdate(product:$product){product{id} userErrors{field message}}}`,{product:{id,title:p.title,descriptionHtml:p.descriptionHtml,status:p.status,tags:p.tags,productType:p.productType,seo:{title:p.seoTitle,description:p.seoDescription}}});userErrors(d.productUpdate);
 if(variants.length){const v=await admin(`mutation($pid:ID!,$v:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$pid,variants:$v){userErrors{field message}}}`,{pid:id,v:variants.map(x=>({id:x.id,price:x.price,compareAtPrice:x.compareAtPrice}))});userErrors(v.productVariantsBulkUpdate);}}
/* ---------- Homepage collections ---------- */
export async function collectionByHandle(handle:string){const d=await admin(`query($q:String!){collections(first:1,query:$q){nodes{id handle title sortOrder ruleSet{rules{column relation condition}} products(first:50){nodes{id handle}}}}}`,{q:`handle:${handle}`});return d.collections.nodes.find((c:any)=>c.handle===handle)||null;}
async function idsForHandles(handles:string[]){if(!handles.length)return new Map<string,string>();const d=await admin(`query($q:String!){products(first:50,query:$q){nodes{id handle}}}`,{q:handles.map(h=>`handle:${h}`).join(' OR ')});return new Map<string,string>(d.products.nodes.map((p:any)=>[p.handle,p.id]));}
export async function setBestSellers(handles:string[]){
 const c=await collectionByHandle('best-sellers');if(!c)throw new AdminError('Create a manual collection called “Best Sellers” in Shopify first.');if(c.ruleSet)throw new AdminError('“Best Sellers” is an automated collection; make it manual to choose products here.');
 const ids=await idsForHandles(handles);const want=handles.map(h=>ids.get(h)).filter(Boolean) as string[];const have=c.products.nodes.map((p:any)=>p.id);
 const remove=have.filter((x:string)=>!want.includes(x)),add=want.filter(x=>!have.includes(x));
 if(remove.length){const r=await admin(`mutation($id:ID!,$p:[ID!]!){collectionRemoveProducts(id:$id,productIds:$p){userErrors{field message}}}`,{id:c.id,p:remove});userErrors(r.collectionRemoveProducts);}
 if(add.length){const r=await admin(`mutation($id:ID!,$p:[ID!]!){collectionAddProductsV2(id:$id,productIds:$p){userErrors{field message}}}`,{id:c.id,p:add});userErrors(r.collectionAddProductsV2);}
 if(c.sortOrder!=='MANUAL'){const r=await admin(`mutation($input:CollectionInput!){collectionUpdate(input:$input){userErrors{field message}}}`,{input:{id:c.id,sortOrder:'MANUAL'}});userErrors(r.collectionUpdate);}
 if(want.length){const r=await admin(`mutation($id:ID!,$m:[MoveInput!]!){collectionReorderProducts(id:$id,moves:$m){userErrors{field message}}}`,{id:c.id,m:want.map((pid,i)=>({id:pid,newPosition:String(i)}))});userErrors(r.collectionReorderProducts);}}
export async function setNewArrivals(handles:string[]){
 const d=await admin(`query{products(first:100,query:"tag:'New arrival'"){nodes{id handle}}}`);const current:any[]=d.products.nodes;const ids=await idsForHandles(handles);
 for(const p of current)if(!handles.includes(p.handle)){const r=await admin(`mutation($id:ID!,$t:[String!]!){tagsRemove(id:$id,tags:$t){userErrors{message}}}`,{id:p.id,t:['New arrival']});userErrors(r.tagsRemove);}
 for(const h of handles){const id=ids.get(h);if(id&&!current.some(p=>p.id===id)){const r=await admin(`mutation($id:ID!,$t:[String!]!){tagsAdd(id:$id,tags:$t){userErrors{message}}}`,{id,t:['New arrival']});userErrors(r.tagsAdd);}}}
/* ---------- Discount codes ---------- */
export async function listDiscounts(){
 const d=await admin(`query{codeDiscountNodes(first:50,sortKey:CREATED_AT,reverse:true){nodes{id codeDiscount{__typename ... on DiscountCodeBasic{title status startsAt endsAt usageLimit asyncUsageCount appliesOncePerCustomer codes(first:1){nodes{code}} customerGets{value{__typename ... on DiscountPercentage{percentage} ... on DiscountAmount{amount{amount}}}} minimumRequirement{__typename ... on DiscountMinimumSubtotal{greaterThanOrEqualToSubtotal{amount}}}} ... on DiscountCodeFreeShipping{title status startsAt endsAt asyncUsageCount codes(first:1){nodes{code}}}}}}}`);
 return d.codeDiscountNodes.nodes as any[];}
export async function createDiscount(x:{auto?:boolean;title:string;code:string;kind:'percent'|'amount';value:number;min:number|null;startsAt:string;endsAt:string|null;usageLimit:number|null;oncePerCustomer:boolean}){
 const base:any={title:x.title,code:x.code,startsAt:x.startsAt,endsAt:x.endsAt,usageLimit:x.usageLimit,appliesOncePerCustomer:x.oncePerCustomer,
  customerGets:{value:x.kind==='percent'?{percentage:x.value/100}:{discountAmount:{amount:String(x.value),appliesOnEachItem:false}},items:{all:true}},
  ...(x.min?{minimumRequirement:{subtotal:{greaterThanOrEqualToSubtotal:String(x.min)}}}:{})};
 if(x.auto){/* applies on its own in the basket and checkout, no code needed */
  const a:any={title:x.title,startsAt:x.startsAt,endsAt:x.endsAt,customerGets:base.customerGets,...(base.minimumRequirement?{minimumRequirement:base.minimumRequirement}:{})};
  const runA=(extra:any)=>admin(`mutation($d:DiscountAutomaticBasicInput!){discountAutomaticBasicCreate(automaticBasicDiscount:$d){automaticDiscountNode{id} userErrors{field message}}}`,{d:{...a,...extra}});
  let r:any;try{r=await runA({context:{all:'ALL'}});}catch(e){if(/context/i.test(String((e as Error).message)))r=await runA({});else throw e;}
  userErrors(r.discountAutomaticBasicCreate);return;}
 const run=(extra:any)=>admin(`mutation($d:DiscountCodeBasicInput!){discountCodeBasicCreate(basicCodeDiscount:$d){codeDiscountNode{id} userErrors{field message}}}`,{d:{...base,...extra}});
 let d:any;try{d=await run({context:{all:'ALL'}});}catch(e){if(/context/i.test(String((e as Error).message)))d=await run({customerSelection:{all:true}});else throw e;}
 userErrors(d.discountCodeBasicCreate);}
export async function setDiscountActive(id:string,active:boolean){const auto=/DiscountAutomaticNode/.test(id);const m=auto?(active?'discountAutomaticActivate':'discountAutomaticDeactivate'):(active?'discountCodeActivate':'discountCodeDeactivate');const d=await admin(`mutation($id:ID!){${m}(id:$id){userErrors{field message}}}`,{id});userErrors(d[m]);}
