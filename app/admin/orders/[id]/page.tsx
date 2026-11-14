import {notFound} from 'next/navigation';
import AdminShell,{AdmNotice} from '@/components/AdminShell';import ShopNotConnected from '@/components/ShopNotConnected';import {requireStaff} from '@/lib/auth';
import {adminReady,money,shopAdminUrl} from '@/lib/shopify-admin';import {getOrder} from '@/lib/shop-admin-data';import {fulfilAction,orderNoteAction} from '@/app/admin/shop-actions';
export const metadata={title:'Order · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const dt=(s:string)=>new Date(s).toLocaleString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
export default async function Order({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;e?:string}>}){
 const u=await requireStaff();const {id}=await params;const {saved,e}=await searchParams;if(!/^\d{1,20}$/.test(id))notFound();
 if(!adminReady)return <AdminShell user={u} active="/admin/orders" title="Order"><ShopNotConnected what="Orders"/></AdminShell>;
 const o=await getOrder('gid://shopify/Order/'+id).catch(()=>null);if(!o)notFound();
 const c=o.totalPriceSet.shopMoney.currencyCode;const m=(x:any)=>money(x?.shopMoney?.amount,c);
 const toSend=o.fulfillmentOrders.nodes.some((f:any)=>['OPEN','IN_PROGRESS','SCHEDULED'].includes(f.status)&&f.lineItems.nodes.some((l:any)=>l.remainingQuantity>0));const a=o.shippingAddress;
 return <AdminShell user={u} active="/admin/orders" eyebrow={dt(o.createdAt)} title={'Order '+o.name} actions={<a className="adm-clear" href="/admin/orders">← All orders</a>}>
  {saved&&<AdmNotice>{saved==='fulfilled'?'Marked as sent. The customer has been emailed their tracking details if you ticked “notify”.':'Note saved.'}</AdmNotice>}{e&&<AdmNotice kind="error">{e}</AdmNotice>}
  {o.cancelledAt&&<AdmNotice kind="error">This order was cancelled.</AdmNotice>}
  <div className="adm-cols">
   <section className="adm-card"><h2>Items</h2>
    <ul className="adm-lines">{o.lineItems.nodes.map((l:any)=><li key={l.id}><span className="thumb">{l.image&&<img src={l.image.url} alt=""/>}</span><span><b>{l.title}</b><small>{[l.variantTitle,l.sku].filter(Boolean).join(' · ')}</small></span><span>{l.quantity} × {m(l.originalUnitPriceSet)}</span></li>)}</ul>
    <dl className="adm-totals"><div><dt>Subtotal</dt><dd>{m(o.subtotalPriceSet)}</dd></div>{Number(o.totalDiscountsSet?.shopMoney?.amount)>0&&<div><dt>Discount {o.discountCodes?.join(', ')}</dt><dd>−{m(o.totalDiscountsSet)}</dd></div>}<div><dt>Delivery</dt><dd>{m(o.totalShippingPriceSet)}</dd></div><div><dt>VAT included</dt><dd>{m(o.totalTaxSet)}</dd></div><div className="tot"><dt>Total</dt><dd>{m(o.totalPriceSet)}</dd></div></dl>
    <p className="adm-muted">Payment: <b>{o.displayFinancialStatus.toLowerCase().replace(/_/g,' ')}</b> · Delivery: <b>{o.displayFulfillmentStatus.toLowerCase().replace(/_/g,' ')}</b></p>
   </section>
   <section className="adm-card"><h2>Customer</h2>
    <p><b>{o.customer?.displayName||a?.name||'Guest'}</b>{o.customer?.numberOfOrders>1&&<span className="adm-status s-live" style={{marginLeft:8}}>{o.customer.numberOfOrders} orders</span>}<br/>{o.email&&<a href={'mailto:'+o.email}>{o.email}</a>}<br/>{(o.phone||a?.phone)&&<a href={'tel:'+(o.phone||a.phone).replace(/\s/g,'')}>{o.phone||a.phone}</a>}</p>
    {a&&<><h3 className="adm-sub">Delivery address</h3><address className="adm-address">{[a.name,a.company,a.address1,a.address2,a.city,a.province,a.zip,a.country].filter(Boolean).map((x:string,i:number)=><span key={i}>{x}<br/></span>)}</address></>}
    <form action={orderNoteAction} className="auth-form compact"><input type="hidden" name="order" value={id}/><label>Internal note (not shown to the customer)<textarea name="note" rows={3} defaultValue={o.note||''}/></label><button className="adm-btn ghost">Save note</button></form>
   </section>
  </div>
  <section className="adm-card adm-wide"><h2>Delivery</h2>
   {o.fulfillments?.length>0&&<ul className="adm-feed">{o.fulfillments.map((f:any,i:number)=><li key={i}><time>{dt(f.createdAt)}</time><p>Sent{f.trackingInfo?.[0]?<> · {f.trackingInfo[0].company} {f.trackingInfo[0].url?<a href={f.trackingInfo[0].url} target="_blank" rel="noopener">{f.trackingInfo[0].number}</a>:f.trackingInfo[0].number}</>:''}</p></li>)}</ul>}
   {toSend&&!o.cancelledAt?<form action={fulfilAction} className="auth-form compact adm-form-grid"><input type="hidden" name="order" value={id}/>
    <label>Courier<select name="carrier" defaultValue="FedEx"><option>FedEx</option><option>DPD</option><option>Royal Mail</option><option>DHL</option><option>UPS</option><option>Own delivery</option><option>Other</option></select></label>
    <label>Tracking number<input name="tracking" placeholder="Optional"/></label><label>Tracking link<input name="trackingUrl" type="url" placeholder="Optional"/></label>
    <label className="auth-check span2"><input type="checkbox" name="notify" defaultChecked/> Email the customer that it’s on its way</label>
    <button className="pill">Mark as sent</button></form>:!o.fulfillments?.length&&<p className="adm-muted">Nothing to send.</p>}
  </section>
  <p className="adm-muted">Refunds, edits and cancellations: <a href={shopAdminUrl('orders/'+id)} target="_blank" rel="noopener">open this order in Shopify ↗</a></p>
 </AdminShell>;}
