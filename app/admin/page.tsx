import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';import {products,connected} from '@/lib/shopify';
export const metadata={title:'Dashboard · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Dashboard({searchParams}:{searchParams:Promise<{welcome?:string;e?:string}>}){
 const u=await requireStaff();const {welcome,e}=await searchParams;
 const [items,customers,staff,decRaw,tasksRaw,log]=await Promise.all([products(),kv<number>('SCARD','users:customers'),kv<number>('SCARD','users:staff'),hgetall('kl:decisions'),hgetall('kl:tasks'),kv<string[]>('LRANGE','audit',0,7)]);
 const dec={keep:0,maybe:0,remove:0} as Record<string,number>;Object.values(decRaw).forEach(v=>{try{const s=JSON.parse(v).s;if(s in dec)dec[s]++;}catch{}});
 const tasks=Object.keys(tasksRaw).length, cats=new Set(items.map(p=>p.category)).size;
 const stats:[string,string,string][]=[['Products live',String(items.length),cats+' categories'],['Customers',String(customers),'registered accounts'],['Keep List',dec.keep+' keep',dec.maybe+' maybe · '+dec.remove+' remove'],['Launch plan',Math.round(tasks/90*100)+'%',tasks+' of 90 tasks done']];
 const first=u.name.split(' ')[0];
 return <AdminShell user={u} active="/admin" eyebrow={new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} title={(welcome?'Welcome, ':'Good to see you, ')+first+'.'}>
  {welcome&&<AdmNotice>Your owner account is ready. Add the rest of the team from the Team page.</AdmNotice>}
  {e==='role'&&<AdmNotice kind="error">Your role doesn’t include that page. Ask the owner if you need access.</AdmNotice>}
  <div className="adm-stats">{stats.map(([l,v,s])=><div className="adm-stat" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>)}</div>
  <div className="adm-cols">
   <section className="adm-card"><h2>Store connection</h2>
    <ul className="adm-checks"><li data-ok="true">Website live on Vercel</li><li data-ok="true">Database connected</li><li data-ok={String(connected)}>{connected?'Shopify connected: products, basket and checkout are live':'Shopify not connected yet: products come from the Visualsoft backup'}</li></ul>
    <p className="adm-muted">Once Shopify is connected, product edits, orders and stock will appear here.</p></section>
   <section className="adm-card"><h2>Quick links</h2><div className="adm-links">
    <a href="/admin/products">Browse products ↗</a><a href="/keep-list-2ca1hj9g0n" target="_blank" rel="noopener">Keep List &amp; launch plan ↗</a><a href="/studio" target="_blank" rel="noopener">Room Studio ↗</a><a href="/shop" target="_blank" rel="noopener">Shop page ↗</a>{['owner','admin'].includes(u.role)&&<a href="/admin/team">Add a team member ↗</a>}</div></section>
   <section className="adm-card adm-wide"><h2>Recent activity</h2>{log.length?<ol className="adm-log">{log.map((l,i)=>{let a:{at:string;by:string;action:string;detail?:string}|null=null;try{a=JSON.parse(l);}catch{}return a&&<li key={i}><time>{new Date(a.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time><span><b>{a.by}</b> {a.action.toLowerCase()}{a.detail?': '+a.detail:''}</span></li>;})}</ol>:<p className="adm-muted">No activity yet.</p>}</section>
  </div>
 </AdminShell>;
}
