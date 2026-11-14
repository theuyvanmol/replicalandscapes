import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {kv,hgetall} from '@/lib/kv';import {products,connected} from '@/lib/shopify';import {adminReady,money} from '@/lib/shopify-admin';import {salesSummary,salesDetail} from '@/lib/shop-admin-data';import {liveNow,stats as siteStats} from '@/lib/analytics';import LiveNow from '@/components/LiveNow';
export const metadata={title:'Dashboard · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const fmt=(n:number)=>n.toLocaleString('en-GB');const pct=(a:number,b:number)=>b?((a/b)*100).toFixed(a/b<0.1?1:0)+'%':'–';
const nice=(p:string)=>p==='/'?'Homepage':p.replace(/^\/(products|collections|blog)\//,'').replace(/[-/]/g,' ').trim()||p;
function Bars({data,label,money:asMoney}:{data:{d:string;v:number}[];label:string;money?:boolean}){const max=Math.max(1,...data.map(x=>x.v));const w=100/data.length;
 return <figure className="dash-chart"><figcaption>{label}</figcaption><svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={label}>{data.map((x,i)=><rect key={x.d} x={i*w+w*0.15} width={w*0.7} y={40-Math.max(x.v?1.2:0,x.v/max*38)} height={Math.max(x.v?1.2:0,x.v/max*38)} rx="0.6"><title>{new Date(x.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}: {asMoney?'£'+x.v.toFixed(2):fmt(x.v)}</title></rect>)}</svg>
  <div className="dash-axis"><span>{new Date(data[0].d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span><span>{new Date(data[data.length-1].d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span></div></figure>;}
function List({title,rows,link,empty}:{title:string;rows:[string,number][];link?:(k:string)=>string;empty:string}){const max=Math.max(1,...rows.map(r=>r[1]));
 return <section className="adm-card dash-list"><h2>{title}</h2>{rows.length?<ul>{rows.map(([k,n])=><li key={k} style={{['--w' as string]:(n/max*100)+'%'}}>{link?<a href={link(k)} target="_blank" rel="noopener">{nice(k)}</a>:<span>{nice(k)}</span>}<b>{fmt(n)}</b></li>)}</ul>:<p className="adm-muted">{empty}</p>}</section>;}
export default async function Dashboard({searchParams}:{searchParams:Promise<{welcome?:string;e?:string;r?:string}>}){
 const u=await requireStaff();const {welcome,e,r}=await searchParams;const days=r==='1'?1:r==='30'?30:7;
 const [items,customers,staff,decRaw,tasksRaw,log]=await Promise.all([products(),kv<number>('SCARD','users:customers'),kv<number>('SCARD','users:staff'),hgetall('kl:decisions'),hgetall('kl:tasks'),kv<string[]>('LRANGE','audit',0,7)]);
 const dec={keep:0,maybe:0,remove:0} as Record<string,number>;Object.values(decRaw).forEach(v=>{try{const s=JSON.parse(v).s;if(s in dec)dec[s]++;}catch{}});
 const tasks=Object.keys(tasksRaw).length, cats=new Set(items.map(p=>p.category)).size;
 const stats:[string,string,string][]=[['Products live',String(items.length),cats+' categories'],['Customers',String(customers),'registered accounts'],['Keep List',dec.keep+' keep',dec.maybe+' maybe · '+dec.remove+' remove'],['Launch plan',Math.round(tasks/90*100)+'%',tasks+' of 90 tasks done']];
 const first=u.name.split(' ')[0];
 const [sales,detail,site,live,today]=await Promise.all([adminReady?salesSummary().catch(()=>null):null,adminReady?salesDetail(days).catch(()=>null):null,siteStats(days).catch(()=>null),liveNow().catch(()=>({count:0,pages:[],countries:[]})),siteStats(1).catch(()=>null)]);
 const visitors=site?.visitors||0;const ord=detail?.orders||0;
 const salesSeries=(site?.series||[]).map(x=>({d:x.d,v:detail?.byDay.get(x.d)?.t||0}));const visitSeries=(site?.series||[]).map(x=>({d:x.d,v:x.uv}));
 const funnel:[string,number][]=[['Visitors',visitors],['Viewed a product',site?.pdp||0],['Added to basket',site?.atc||0],['Went to checkout',site?.checkout||0],['Ordered',ord]];
 const fmax=Math.max(1,...funnel.map(f=>f[1]));
 const period=days===1?'today':'last '+days+' days';
 return <AdminShell user={u} active="/admin" eyebrow={new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} title={(welcome?'Welcome, ':'Good to see you, ')+first+'.'}>
  {welcome&&<AdmNotice>Your owner account is ready. Add the rest of the team from the Team page.</AdmNotice>}
  {e==='role'&&<AdmNotice kind="error">Your role doesn’t include that page. Ask the owner if you need access.</AdmNotice>}
  <LiveNow initial={{live,today:{visitors:today?.visitors||0,pv:today?.pv||0,atc:today?.atc||0,checkout:today?.checkout||0}}}/>
  <div className="dash-bar"><h2>Performance, {period}</h2><nav className="dash-tabs" aria-label="Period">{[['1','Today'],['7','7 days'],['30','30 days']].map(([k,l])=><a key={k} href={'/admin?r='+k} aria-current={String(days)===k?'page':undefined}>{l}</a>)}</nav></div>
  <div className="adm-stats adm-sales">
   <div className="adm-stat"><small>Sales</small><b>{detail?money(detail.total):'–'}</b><span>{detail?fmt(ord)+' orders':'connect Shopify admin'}</span></div>
   <div className="adm-stat"><small>Average order</small><b>{detail&&ord?money(detail.aov):'–'}</b><span>per order</span></div>
   <div className="adm-stat"><small>Visitors</small><b>{fmt(visitors)}</b><span>{fmt(site?.pv||0)} page views</span></div>
   <div className="adm-stat"><small>Conversion</small><b>{pct(ord,visitors)}</b><span>of visitors ordered</span></div>
   {sales&&<a className="adm-stat" href="/admin/orders"><small>Orders to send</small><b>{sales.toFulfil}</b><span>waiting to be packed</span></a>}
  </div>
  {days>1&&<div className="adm-cols dash-charts"><section className="adm-card"><Bars data={salesSeries} label="Sales per day" money/></section><section className="adm-card"><Bars data={visitSeries} label="Visitors per day"/></section></div>}
  <section className="adm-card dash-funnel"><h2>From visit to order</h2><ol>{funnel.map(([l,n],i)=><li key={l}><span>{l}</span><i style={{width:Math.max(n?2:0,n/fmax*100)+'%'}}/><b>{fmt(n)}</b>{i>0&&<em>{pct(n,funnel[i-1][1])}</em>}</li>)}</ol><p className="adm-muted">Visitor numbers are counted by the website itself (no cookies). Orders come from Shopify.</p></section>
  <div className="dash-lists">
   <List title="Best sellers" rows={detail?.best||[]} empty={adminReady?'No orders in this period yet.':'Appears once Shopify admin is connected.'}/>
   <List title="Most viewed products" rows={site?.prods||[]} link={k=>'/products/'+k} empty="No product views yet."/>
   <List title="Top pages" rows={site?.pages||[]} link={k=>k} empty="No visits yet."/>
   <List title="Where visitors come from" rows={(site?.refs||[])} empty="Mostly direct visits so far."/>
   <List title="Countries" rows={site?.cc||[]} empty="–"/>
   <List title="Devices" rows={site?.dev||[]} empty="–"/>
  </div>
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
