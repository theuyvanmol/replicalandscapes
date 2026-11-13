import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';
export const metadata={title:'Customers · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const d=(s?:string)=>s?new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'–';
export default async function Customers(){
 const u=await requireStaff(['owner','admin']);
 const emails=(await kv<string[]>('SMEMBERS','users:customers'))||[];
 const people=(await Promise.all(emails.slice(0,500).map(e=>hgetall('user:'+e)))).filter(p=>p.email).sort((a,b)=>(b.created||'').localeCompare(a.created||''));
 return <AdminShell user={u} active="/admin/customers" eyebrow={people.length+' registered'} title="Customers">
  {people.length?<div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Joined</th><th>Last sign-in</th><th>Emails</th></tr></thead><tbody>
   {people.map(p=><tr key={p.email}><td><b>{p.name}</b></td><td>{p.email}</td><td>{p.company||'–'}</td><td>{d(p.created)}</td><td>{d(p.lastLogin)}</td><td>{p.marketing==='yes'?'Subscribed':'No'}</td></tr>)}
  </tbody></table></div>:<section className="adm-card"><h2>No customer accounts yet</h2><p className="adm-muted">Customers who create an account on the website will appear here. Existing Visualsoft customers are imported with Shopify.</p></section>}
 </AdminShell>;
}
