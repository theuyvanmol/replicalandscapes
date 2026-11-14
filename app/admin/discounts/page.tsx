import AdminShell,{AdmNotice} from '@/components/AdminShell';import ShopNotConnected from '@/components/ShopNotConnected';import {requireStaff} from '@/lib/auth';
import {adminReady,money} from '@/lib/shopify-admin';import {listDiscounts} from '@/lib/shop-admin-data';import {createDiscountAction,toggleDiscountAction} from '@/app/admin/shop-actions';
export const metadata={title:'Discount codes · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const d=(s:string|null)=>s?new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'No end date';
export default async function Discounts({searchParams}:{searchParams:Promise<{saved?:string;e?:string}>}){const u=await requireStaff(['owner','admin']);const {saved,e}=await searchParams;
 let list:any[]=[],error='';if(adminReady){try{list=await listDiscounts();}catch(x){error=(x as Error).message;}}
 return <AdminShell user={u} active="/admin/discounts" eyebrow="Shopify" title="Discounts" actions={adminReady?<a className="pill" href="#new">New code <span aria-hidden="true">+</span></a>:undefined}>
  {saved&&<AdmNotice>{saved==='1'?'Saved.':saved==='auto'?'Sale created. It applies automatically in the basket and at checkout.':`Code ${saved} created. Customers can enter it in the basket or at checkout.`}</AdmNotice>}{(e||error)&&<AdmNotice kind="error">{e||error}</AdmNotice>}
  {!adminReady?<ShopNotConnected what="Discount codes"/>:<>
   <p className="adm-banner">Two kinds: an <b>automatic sale</b> (e.g. Black Friday 20% off everything) applies by itself in the basket, while a <b>code</b> (e.g. WELCOME10) has to be entered. To advertise one on the homepage, add it to a promotion in <a href="/admin/promotions">Promotions &amp; events</a>.</p>
   {list.length?<ul className="adm-promos">{list.map(n=>{const c=n.codeDiscount;const code=c.codes?.nodes?.[0]?.code;const v=c.customerGets?.value;const val=c.__typename==='DiscountCodeFreeShipping'?'Free delivery':v?.__typename==='DiscountPercentage'?Math.round(v.percentage*100)+'% off':v?.amount?money(v.amount.amount)+' off':'';const active=c.status==='ACTIVE';
    return <li key={n.id}><span className="adm-stage">%</span><span className="adm-promo-main"><small>{val}{c.minimumRequirement?.greaterThanOrEqualToSubtotal?` · over ${money(c.minimumRequirement.greaterThanOrEqualToSubtotal.amount)}`:''}</small><b>{code||c.title}</b>{n.auto&&<em className="adm-auto">Automatic</em>}<span>{d(c.startsAt)} – {d(c.endsAt)} · used {c.asyncUsageCount}{c.usageLimit?` of ${c.usageLimit}`:''} times</span></span>
     <span className={'adm-status '+(active?'s-live':c.status==='SCHEDULED'?'s-sched':'s-draft')}>{c.status.toLowerCase()}</span>
     <span className="adm-promo-act">{c.status!=='EXPIRED'&&<form action={toggleDiscountAction}><input type="hidden" name="id" value={n.id}/><input type="hidden" name="active" value={active?'0':'1'}/><button className="adm-clear">{active?'Switch off':'Switch on'}</button></form>}</span></li>;})}</ul>
   :<section className="adm-card adm-empty"><h2>No discount codes yet</h2><p className="adm-muted">Create one below, for example BLACKFRIDAY for 25% off.</p></section>}
   <section className="adm-card" id="new"><h2>New discount</h2>
    <form action={createDiscountAction} className="auth-form compact adm-form-grid">
     <label>How it works<select name="how"><option value="code">Customer enters a code</option><option value="auto">Automatic sale, no code needed</option></select></label>
     <label>Code <span>for code discounts</span><input name="code" placeholder="BLACKFRIDAY" style={{textTransform:'uppercase'}}/></label>
     <label>Type<select name="kind"><option value="percent">Percentage off</option><option value="amount">Fixed amount off (£)</option></select></label>
     <label>Amount<input name="value" required inputMode="decimal" placeholder="25"/></label>
     <label>Minimum spend (£) <span>optional</span><input name="min" inputMode="decimal"/></label>
     <label>Starts<input name="start" type="date"/></label><label>Ends <span>optional</span><input name="end" type="date"/></label>
     <label>Total uses <span>optional</span><input name="limit" inputMode="numeric"/></label>
     <label className="auth-check"><input type="checkbox" name="once" defaultChecked/> One use per customer</label>
     <label>Name <span>shown to customers for automatic sales</span><input name="title" placeholder="Black Friday 20% off"/></label>
     <button className="pill">Create discount</button></form></section>
  </>}
 </AdminShell>;}
