import StoreShell from '@/components/StoreShell';
import {Notice} from '@/components/AuthLayout';
import PlantPicker from '@/components/PlantPicker';
import {CareBadge,PlantTips,careProgress,when} from '@/components/PlantCard';
import {requireCustomer} from '@/lib/auth';
import {listPlants,careStatus} from '@/lib/portal';
import {pickList} from '@/lib/plant-catalogue';
import {addMyPlant,careDone,editMyPlant,removeMyPlant} from '@/app/account/portal-actions';
export const metadata={title:'My plants',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const SAVED:Record<string,string>={added:'Added to your plants. We’ll remind you when it’s due a refresh.',care:'Lovely. We’ve reset its care reminder.',edit:'Saved.',removed:'Removed from your plants.'};
const ERR:Record<string,string>={pick:'Please choose a product from the list.',full:'You can add up to 200 plants.'};
const INTERVALS:[number,string][]=[[30,'Every month'],[60,'Every 2 months'],[90,'Every 3 months'],[120,'Every 4 months'],[180,'Every 6 months'],[365,'Once a year']];
export default async function MyPlants({searchParams}:{searchParams:Promise<{saved?:string;e?:string}>}){
 const u=await requireCustomer();const {saved,e}=await searchParams;
 const [plants,items]=await Promise.all([listPlants(u.email),pickList()]);
 const sorted=[...plants].sort((a,b)=>careStatus(a).days-careStatus(b).days);const due=plants.filter(p=>careStatus(p).state==='due').length;
 const month=new Date().toISOString().slice(0,7);
 return <StoreShell><div className="our-story-page ed-page acc">
  <section className="our-story-hero ed-hero acc-head">
   <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/account">Your account</a><span aria-hidden="true">/</span><span aria-current="page">My plants</span></nav>
   <p className="eyebrow">MY PLANTS</p><h1><span className="ed-line"><span>Your greenery,</span></span><span className="ed-line"><span style={{'--d':1} as React.CSSProperties}><em>cared for.</em></span></span></h1>
   <div className="story-hero-bottom ed-fade"><p>{plants.length?`${plants.length} ${plants.length===1?'plant':'plants'}${due?`, ${due} due for care`:', all looking their best'}. Artificial plants need no water, just a little attention now and then.`:'Add the plants and trees you own to get care reminders and tips for each one.'}</p><a className="text-link" href="#add">Add a plant ↓</a></div>
  </section>
  {saved&&SAVED[saved]&&<Notice kind="ok">{SAVED[saved]}</Notice>}{e&&ERR[e]&&<Notice kind="error">{ERR[e]}</Notice>}
  {sorted.length>0&&<div className="plants">{sorted.map(p=>{const s=careStatus(p);return <article key={p.id} id={'p-'+p.id} className={'plant plant-'+s.state}>
   <a className="plant-img" href={'/products/'+p.handle}>{p.image&&<img src={p.image} alt={p.title} loading="lazy" decoding="async"/>}</a>
   <div className="plant-body">
    <p className="editorial-number">{p.category.toUpperCase()}{p.addedBy==='team'?' · ADDED BY OUR TEAM':''}</p>
    <h3><a href={'/products/'+p.handle}>{p.title}</a></h3>
    <p className="plant-meta">{[p.size,p.room,'Since '+new Date(p.added).toLocaleDateString('en-GB',{month:'long',year:'numeric'})].filter(Boolean).join(' · ')}</p>
    {p.note&&<p className="plant-note">{p.note}</p>}
    <div className="plant-care"><CareBadge p={p}/><span className="plant-bar"><i style={{width:careProgress(p)+'%'}}/></span><small>{p.reminders?`Care every ${Math.round(p.interval/30)} months · last refreshed ${when(p.lastCare)}`:'Reminders are off'}</small></div>
    <div className="plant-actions">
     <form action={careDone}><input type="hidden" name="id" value={p.id}/><button className="pill">I’ve refreshed it <span>✓</span></button></form>
     <a className="text-link" href={'/products/'+p.handle}>Buy again ↗</a>
     <a className="text-link" href="/contact?topic=Leaf%20Clean%20maintenance">Book a Leaf Clean ↗</a>
    </div>
    <details className="plant-more"><summary>Care tips</summary><PlantTips p={p}/></details>
    <details className="plant-more"><summary>Edit details</summary>
     <form action={editMyPlant} className="plant-edit"><input type="hidden" name="id" value={p.id}/>
      <label>Room or location<input name="room" defaultValue={p.room} placeholder="e.g. Living room"/></label>
      <label>Size<input name="size" defaultValue={p.size}/></label>
      <label>Care reminder<select name="interval" defaultValue={String(p.interval)}>{INTERVALS.map(([d,l])=><option key={d} value={d}>{l}</option>)}</select></label>
      <label className="auth-check"><input type="checkbox" name="reminders" defaultChecked={p.reminders}/> Remind me when it’s due</label>
      <button className="adm-btn ghost">Save</button></form>
     <form action={removeMyPlant} className="plant-remove"><input type="hidden" name="id" value={p.id}/><button className="text-link">Remove from my plants</button></form>
    </details>
   </div></article>;})}</div>}
  <section className="acc-add" id="add"><div><p className="eyebrow">ADD A PLANT</p><h2>Already own<br/><em>one of ours?</em></h2><p>Add plants you’ve bought from us, on this website or before, and we’ll keep track of their care. Plants from installations by our team are added for you.</p></div>
   <form action={addMyPlant} className="ed-form acc-add-form"><PlantPicker items={items}/>
    <div className="ed-row"><label>Room or location<input name="room" placeholder="e.g. Hallway, terrace"/></label><label>Roughly when you got it<input type="month" name="bought" max={month} defaultValue={month}/></label></div>
    <label className="auth-check"><input type="checkbox" name="reminders" defaultChecked/> Remind me when it’s due a refresh</label>
    <div className="ed-form-foot"><button className="pill">Add to my plants <span>↗</span></button><p>Reminders show here and on your account page.</p></div></form>
  </section>
 </div></StoreShell>;}
