import StoreShell from '@/components/StoreShell';import {Notice} from '@/components/AuthLayout';import {requireCustomer} from '@/lib/auth';import {getUser} from '@/lib/auth';import {logout,updateProfile,changePassword} from '@/app/account/actions';import {connected} from '@/lib/shopify';import {listPlants,careStatus,listProjects,pendingApprovals,unreadForClient,STAGES} from '@/lib/portal';import {PlantMini} from '@/components/PlantCard';import {legacyOrders,money} from '@/lib/legacy';
export const metadata={title:'Your account',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const MSG:Record<string,[string,'ok'|'error']>={name:['Please add your name.','error'],current:['Your current password isn’t right.','error'],password:['Your new password needs at least 10 characters.','error']};
export default async function Account({searchParams}:{searchParams:Promise<{e?:string;saved?:string;welcome?:string}>}){
 const u=await requireCustomer();const full=await getUser(u.email) as Record<string,string>|null;const {e,saved,welcome}=await searchParams;
 const first=u.name.split(' ')[0];
 const [plants,projects,past]=await Promise.all([listPlants(u.email).catch(()=>[]),listProjects(u.email).catch(()=>[]),legacyOrders(u.email).then(l=>l.filter(o=>!/failed|incomplete|pending/i.test(o.state)))]);
 const fd=(x:string)=>new Date(x.replace(' ','T')).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 const due=plants.filter(p=>p.reminders&&careStatus(p).state==='due');const approvals=projects.reduce((n,p)=>n+pendingApprovals(p),0);const news=projects.reduce((n,p)=>n+unreadForClient(p),0);
 const byDue=[...plants].sort((a,b)=>careStatus(a).days-careStatus(b).days);
 return <StoreShell><div className="our-story-page ed-page acc">
  <section className="our-story-hero ed-hero acc-head">
   <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Your account</span></nav>
   <p className="eyebrow">YOUR ACCOUNT</p>
   <h1><span className="ed-line"><span>{welcome?'Welcome, ':'Hello, '}{first}.</span></span></h1>
   <div className="story-hero-bottom ed-fade"><p>Signed in as {u.email}</p><form action={logout}><button className="text-link acc-out">Sign out ↗</button></form></div>
  </section>
  {welcome&&<Notice kind="ok">Your account is ready. Add the plants you own to get care reminders, and follow any bespoke projects here.</Notice>}
  {saved&&<Notice kind="ok">{saved==='pw'?'Password changed.':'Your details are saved.'}</Notice>}
  {e&&MSG[e]&&<Notice kind={MSG[e][1]}>{MSG[e][0]}</Notice>}
  <ul className="acc-attn">
   <li className={due.length?'is-on':''}><a href="/account/plants"><b>{due.length}</b><span>{due.length===1?'plant is':'plants are'} due for care</span></a></li>
   <li className={approvals?'is-on':''}><a href={projects[0]?'/account/projects/'+(projects.find(p=>pendingApprovals(p))||projects[0]).id+'#approvals':'/account'}><b>{approvals}</b><span>{approvals===1?'item needs':'items need'} your approval</span></a></li>
   <li className={news?'is-on':''}><a href={projects[0]?'/account/projects/'+projects[0].id:'/account'}><b>{news}</b><span>new project {news===1?'update':'updates'}</span></a></li>
  </ul>

  <section className="acc-section"><div className="ed-section-head ed-head-row"><div><p className="eyebrow">01 / MY PLANTS</p><h2>Your greenery,<br/><em>cared for.</em></h2></div><a className="text-link" href="/account/plants">{plants.length?'See all & add plants ↗':'Add a plant ↗'}</a></div>
   {plants.length?<div className="plant-minis">{byDue.slice(0,4).map(p=><PlantMini key={p.id} p={p}/>)}</div>
   :<div className="acc-empty"><p className="intro-lead">Add the plants and trees you own and we’ll remind you when they’re due a refresh, with care tips for each one.</p><a className="pill" href="/account/plants#add">Add your first plant <span>↗</span></a></div>}
  </section>

  <section className="acc-section"><div className="ed-section-head ed-head-row"><div><p className="eyebrow">02 / BESPOKE PROJECTS</p><h2>Your projects,<br/><em>start to finish.</em></h2></div>{!projects.length&&<a className="text-link" href="/contact?topic=Bespoke%20installation">Start a project ↗</a>}</div>
   {projects.length?<div className="acc-projects">{projects.map(p=>{const pa=pendingApprovals(p),nu=unreadForClient(p);return <a key={p.id} className="acc-project" href={'/account/projects/'+p.id}>
    <span className="editorial-number">{p.ref}{p.site?' / '+p.site.toUpperCase():''}</span><b>{p.title}</b>
    <span className="pj-mini" aria-label={'Stage: '+STAGES[p.stage]}>{STAGES.map((s,i)=><i key={s} className={i<p.stage?'done':i===p.stage?'now':''}/>)}</span>
    <span className="acc-project-meta"><span>Now: {STAGES[p.stage]}</span>{pa>0&&<span className="care-badge care-due">{pa} to approve</span>}{nu>0&&<span className="care-badge care-soon">{nu} new</span>}</span>
    <span className="text-link">Open project ↗</span></a>;})}</div>
   :<div className="acc-empty"><p className="intro-lead">When we design and install planting for you, your project appears here: progress, proposals to approve, documents and messages in one place.</p></div>}
  </section>

  <section className="acc-section"><div className="ed-section-head"><p className="eyebrow">03 / ORDERS</p></div>
   <div className="acc-orders">{past.length?<><p>Your previous orders with us, including those from artificialplants.co.uk and replicaplants.co.uk.</p><div className="acc-legacy">{past.slice(0,30).map(o=><details key={o.site+o.ref}><summary><b>{fd(o.date)}</b><span>{o.ref} · {o.state}</span><span>{money(o.total)}</span></summary><ul>{o.items.map((i,k)=><li key={k}>{i.q} × {i.n}</li>)}</ul><a className="text-link acc-again" href={'/shop?q='+encodeURIComponent((o.items[0]?.n||'').split(' ').slice(0,3).join(' '))}>Find these again ↗</a></details>)}</div></>:<p>You haven’t placed an order on the new website yet. For help with an earlier order call <a href="tel:+441661871481">01661 871 481</a>.</p>}<a className="text-link" href="/delivery-returns">Delivery &amp; returns ↗</a></div>
  </section>

  <section className="acc-section"><div className="ed-section-head"><p className="eyebrow">04 / YOUR DETAILS</p></div>
   <div className="acc-forms">
    <form action={updateProfile} className="auth-form compact"><h3>Contact details</h3>
     <label htmlFor="name">Full name</label><input id="name" name="name" defaultValue={u.name} required/>
     <label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" defaultValue={full?.phone||''} autoComplete="tel"/>
     <label htmlFor="company">Company (optional)</label><input id="company" name="company" defaultValue={full?.company||''} autoComplete="organization"/>
     <label className="auth-check"><input type="checkbox" name="marketing" defaultChecked={full?.marketing==='yes'}/> Email me new arrivals and seasonal offers.</label>
     <button className="pill auth-submit">Save details</button></form>
    <form action={changePassword} className="auth-form compact"><h3>Password</h3>
     <label htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" required/>
     <label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required/>
     <button className="pill auth-submit">Change password</button></form>
   </div>
  </section>
  <section className="ed-quick acc-quick"><a href="/studio"><span className="editorial-number">PLAN IN 3D</span><b>Room Studio</b><span className="text-link">Open ↗</span></a><a href="/gift-cards"><span className="editorial-number">GIFTING</span><b>Gift cards</b><span className="text-link">Design a card ↗</span></a><a href="/contact"><span className="editorial-number">HELP</span><b>Talk to the team</b><span className="text-link">Contact us ↗</span></a></section>
 </div></StoreShell>;
}
