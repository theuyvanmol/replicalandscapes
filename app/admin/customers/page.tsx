import AdminShell from '@/components/AdminShell';import {requireStaff,normEmail} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';import {markVerified} from '@/app/auth-actions';import {legacyCustomer,legacyOrders,legacySub,legacyCounts,money} from '@/lib/legacy';
export const metadata={title:'Customers · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const d=(s?:string)=>s?new Date(s.replace(' ','T')).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'–';
export default async function Customers({searchParams}:{searchParams:Promise<{q?:string}>}){
 const u=await requireStaff(['owner','admin']);const {q}=await searchParams;const email=q?normEmail(q):'';
 const emails=(await kv<string[]>('SMEMBERS','users:customers'))||[];
 const people=(await Promise.all(emails.slice(0,500).map(e=>hgetall('user:'+e)))).filter(p=>p.email).sort((a,b)=>(b.created||'').localeCompare(a.created||''));
 const counts=await legacyCounts().catch(()=>null);
 const [lc,lo,ls,acct]=email?await Promise.all([legacyCustomer(email),legacyOrders(email),legacySub(email),hgetall('user:'+email)]):[null,[],null,{} as Record<string,string>];
 const spent=lo.reduce((t,o)=>t+o.total,0);
 return <AdminShell user={u} active="/admin/customers" eyebrow={people.length+' on the new website'+(counts?.customers?' · '+counts.customers.toLocaleString('en-GB')+' from the old websites':'')} title="Customers">
  <form className="adm-search" role="search"><input name="q" type="search" defaultValue={q||''} placeholder="Find a customer by email" aria-label="Customer email"/><button className="adm-btn">Find</button>{q&&<a className="adm-clear" href="/admin/customers">Clear</a>}</form>
  {email&&<section className="adm-card"><h2>{lc?(lc.f+' '+lc.l).trim()||email:acct.name||email}</h2>
   {!lc&&!acct.email&&!lo.length&&!ls?<p className="adm-muted">No customer found with that email.</p>:<>
   <p>{email}{lc?.ph?' · '+lc.ph:''}{lc?.mob&&lc.mob!==lc.ph?' · '+lc.mob:''}{lc?.co?' · '+lc.co:''}</p>
   {acct.email&&acct.verified!=='yes'&&<form action={markVerified}><input type="hidden" name="email" value={email}/><button className="adm-btn ghost">Confirm their email (after checking on the phone)</button></form>}
   {lc&&<p className="adm-muted">{[lc.a1,lc.a2,lc.town,lc.county,lc.pc,lc.country].filter(Boolean).join(', ')}</p>}
   <p className="adm-muted">{acct.email?'Has an account on the new website (joined '+d(acct.created)+', email '+(acct.verified==='yes'?'confirmed':'not confirmed yet')+'). ':'No account on the new website yet. '}{lc?'Old website customer since '+d(lc.reg)+' ('+lc.site+'). ':''}Email marketing: {lc?.eo||(ls?.active&&!ls.unsub)?'subscribed':'not subscribed'}.</p>
   {lo.length>0&&<><h3>{lo.length} previous {lo.length===1?'order':'orders'} · {money(spent)}</h3><div className="lg-orders">{lo.map(o=><div className="lg-order" key={o.site+o.ref}><header><b>{o.ref}</b><span>{d(o.date)}</span><span>{o.state}</span><span>{o.site}</span><b>{money(o.total)}</b></header><ul>{o.items.map((i,k)=><li key={k}>{i.q} × {i.n}{i.sku?' ('+i.sku+')':''} · {money(i.p)}</li>)}</ul></div>)}</div></>}
   </>}</section>}
  {people.length?<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Joined</th><th>Last sign-in</th><th>Emails</th><th></th></tr></thead><tbody>
   {people.map(p=><tr key={p.email}><td><b>{p.name}</b></td><td><a href={'/admin/customers?q='+encodeURIComponent(p.email)}>{p.email}</a></td><td>{p.company||'–'}</td><td>{d(p.created)}</td><td>{d(p.lastLogin)}</td><td>{p.marketing==='yes'?'Subscribed':'No'}</td><td><a href={'/admin/care?email='+encodeURIComponent(p.email)+'#add'}>Add plants</a></td></tr>)}
  </tbody></table></div>:<section className="adm-card"><h2>No accounts on the new website yet</h2><p className="adm-muted">Customers who create an account on the new website appear here. Search above to look up anyone from the old websites, with their full order history.</p></section>}
 </AdminShell>;
}
