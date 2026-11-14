import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv} from '@/lib/kv';import {legacyCounts,importKeyTtl} from '@/lib/legacy';import {createKeyAction,revokeKeyAction} from './actions';
export const metadata={title:'Data import · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const fmt=(n:number)=>n.toLocaleString('en-GB');
export default async function ImportPage({searchParams}:{searchParams:Promise<{key?:string}>}){
 const u=await requireStaff(['owner','admin']);const {key}=await searchParams;
 const [c,ttl]=await Promise.all([legacyCounts().catch(()=>({customers:0,subscribers:0,enquiries:0,orderCustomers:0})),importKeyTtl().catch(()=>0)]);
 const k=key&&ttl>0?await kv<string|null>('GET','import:key'):null;
 return <AdminShell user={u} active="/admin/import" eyebrow="FROM THE OLD WEBSITES" title="Data import">
  <section className="adm-stats">
   <div className="adm-stat"><small>Customers</small><b>{fmt(c.customers)}</b><span>real customers kept, bot sign-ups left behind</span></div>
   <div className="adm-stat"><small>Order history</small><b>{fmt(c.orderCustomers)}</b><span>customers with past orders</span></div>
   <div className="adm-stat"><small>Newsletter</small><b>{fmt(c.subscribers)}</b><span>subscribers, consent kept</span></div>
   <div className="adm-stat"><small>Enquiries</small><b>{fmt(c.enquiries)}</b><span>archived messages</span></div>
  </section>
  <section className="adm-card"><h2>What happens to this data</h2>
   <p>Customers, orders, subscribers and enquiries from artificialplants.co.uk and replicaplants.co.uk are stored privately here. When a past customer creates an account on the new website with the same email, their previous orders appear in their account automatically. You can find anyone under <a href="/admin/customers">Customers</a>.</p>
   <p className="adm-muted">Passwords can’t be moved from any platform, so past customers choose a new password when they first sign in.</p></section>
  <section className="adm-card"><h2>Downloads</h2>
   <p><a className="pill" href="/api/admin/export/shopify-customers">Customers for Shopify (CSV) <span>↓</span></a></p>
   <p className="adm-muted">Ready for Shopify → Customers → Import. Email marketing consent is kept exactly as it was on the old website.</p>
   <p><a className="text-link" href="/api/admin/export/orders">Order history (CSV) ↓</a> &nbsp; <a className="text-link" href="/api/admin/export/enquiries">Enquiries archive (CSV) ↓</a></p></section>
  <section className="adm-card"><h2>Import key</h2>
   {ttl>0?<><p>An import key is active for another {Math.ceil(ttl/60)} minutes.</p>{k&&<p><code className="adm-code" id="import-key">{k}</code></p>}<form action={revokeKeyAction}><button className="adm-btn">Turn the key off now</button></form></>
   :<><p className="adm-muted">Only needed while moving data across. The key lasts 3 hours.</p><form action={createKeyAction}><button className="pill">Create import key <span>↗</span></button></form></>}
  </section>
 </AdminShell>;
}
