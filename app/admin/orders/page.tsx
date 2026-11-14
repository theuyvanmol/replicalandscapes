import AdminShell,{AdmNotice} from '@/components/AdminShell';import ShopNotConnected from '@/components/ShopNotConnected';import {requireStaff} from '@/lib/auth';
import {adminReady,money,gidNum} from '@/lib/shopify-admin';import {listOrders,type OrderRow} from '@/lib/shop-admin-data';
export const metadata={title:'Orders · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const dt=(s:string)=>new Date(s).toLocaleString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const fin=(s:string)=>({PAID:'Paid',PENDING:'Payment pending',REFUNDED:'Refunded',PARTIALLY_REFUNDED:'Part refunded',AUTHORIZED:'Authorised',VOIDED:'Voided',PARTIALLY_PAID:'Part paid'} as Record<string,string>)[s]||s.toLowerCase().replace(/_/g,' ');
const ful=(s:string)=>({UNFULFILLED:'To send',FULFILLED:'Sent',PARTIALLY_FULFILLED:'Part sent',IN_PROGRESS:'In progress',ON_HOLD:'On hold',SCHEDULED:'Scheduled',RESTOCKED:'Restocked'} as Record<string,string>)[s]||s.toLowerCase().replace(/_/g,' ');
export default async function Orders({searchParams}:{searchParams:Promise<{f?:string;q?:string;after?:string}>}){const u=await requireStaff();const {f='unfulfilled',q='',after}=await searchParams;
 const filter=(['unfulfilled','open','all'].includes(f)?f:'unfulfilled') as 'unfulfilled'|'open'|'all';
 let data:{rows:OrderRow[];next:string|null}|null=null,error='';if(adminReady){try{data=await listOrders(filter,q,after);}catch(e){error=(e as Error).message;}}
 return <AdminShell user={u} active="/admin/orders" eyebrow="Shopify" title="Orders">
  {error&&<AdmNotice kind="error">{error}</AdmNotice>}
  {!adminReady?<ShopNotConnected what="Orders"/>:<>
   <nav className="adm-tabs">{[['unfulfilled','To send'],['open','Open'],['all','All orders']].map(([k,l])=><a key={k} href={'?f='+k} aria-current={filter===k?'page':undefined}>{l}</a>)}</nav>
   <form className="adm-filters" role="search"><input type="hidden" name="f" value={filter}/><input name="q" defaultValue={q} placeholder="Search by order number, name or email" aria-label="Search orders"/><button className="adm-btn">Search</button>{q&&<a className="adm-clear" href={'?f='+filter}>Clear</a>}</form>
   {data&&data.rows.length?<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th>Delivery</th><th className="num">Total</th></tr></thead><tbody>
    {data.rows.map(o=><tr key={o.id} className={o.cancelled?'is-muted':''}><td><a href={'/admin/orders/'+gidNum(o.id)}><b>{o.name}</b></a>{o.cancelled&&<span>Cancelled</span>}</td><td>{dt(o.createdAt)}</td><td>{o.customer}<span>{o.email}</span></td><td className="adm-items">{o.items}</td>
     <td><span className={'adm-status '+(o.financial==='PAID'?'s-live':'s-sched')}>{fin(o.financial)}</span></td><td><span className={'adm-status '+(o.fulfillment==='FULFILLED'?'s-draft':'s-live')}>{ful(o.fulfillment)}</span></td><td className="num">{money(o.total,o.currency)}</td></tr>)}
   </tbody></table></div>:data&&<section className="adm-card adm-empty"><h2>{filter==='unfulfilled'?'Nothing waiting to be sent':'No orders found'}</h2><p className="adm-muted">{filter==='unfulfilled'?'New orders that need packing and sending appear here.':'Try another search.'}</p></section>}
   {data?.next&&<nav className="adm-pages"><a href={`?f=${filter}&q=${encodeURIComponent(q)}&after=${encodeURIComponent(data.next)}`}>Older orders →</a></nav>}
  </>}
 </AdminShell>;}
