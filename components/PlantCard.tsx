import {careStatus,tipsFor,type Plant} from '@/lib/portal';
const when=(iso:string)=>new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
export function CareBadge({p}:{p:Plant}){const s=careStatus(p);return <span className={'care-badge care-'+s.state}>{s.state==='due'?'Care due now':s.days===1?'Care due tomorrow':`Next care in ${s.days} days`}</span>;}
export function careProgress(p:Plant){const s=careStatus(p);return Math.max(0,Math.min(100,100-(s.days/p.interval)*100));}
export function PlantMini({p}:{p:Plant}){return <a className="plant-mini" href={'/account/plants#p-'+p.id}><span className="plant-img">{p.image&&<img src={p.image} alt="" loading="lazy" decoding="async"/>}</span><span className="plant-mini-copy"><b>{p.title}</b><span>{[p.size,p.room].filter(Boolean).join(' · ')||p.category}</span><CareBadge p={p}/></span></a>;}
export {when};
export function PlantTips({p}:{p:Plant}){return <ul className="plant-tips">{tipsFor(p).map(t=><li key={t}>{t}</li>)}</ul>;}
