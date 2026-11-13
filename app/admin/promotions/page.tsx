import AdminShell,{AdmNotice} from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {listPromos,promoState,ukFormat} from '@/lib/content';import {togglePromoAction} from '@/app/admin/content-actions';
export const metadata={title:'Promotions & events · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const LABEL={live:['Live on homepage','live'],upcoming:['Showing as “coming soon”','sched'],scheduled:['Scheduled','sched'],ended:['Ended','draft'],off:['Switched off','draft']} as const;
const fmt=(s:string)=>ukFormat(s)+' UK';
export default async function Promos({searchParams}:{searchParams:Promise<{saved?:string}>}){
 const u=await requireStaff();const {saved}=await searchParams;const all=await listPromos();
 const groups:[string,typeof all][]=[['On the homepage now',all.filter(p=>['live','upcoming'].includes(promoState(p)))],['Scheduled',all.filter(p=>promoState(p)==='scheduled')],['Switched off or ended',all.filter(p=>['off','ended'].includes(promoState(p)))]];
 return <AdminShell user={u} active="/admin/promotions" eyebrow="Homepage band" title="Promotions & events" actions={<a className="pill" href="/admin/promotions/new">Add promotion or event <span aria-hidden="true">+</span></a>}>
  {saved&&<AdmNotice>{saved==='deleted'?'Removed from the website.':'Saved. The homepage updates within a minute.'}</AdmNotice>}
  <p className="adm-banner">Live promotions show in a full-width animated band under the homepage hero, with a countdown to the end date. Events can show early as “coming soon”. Everything appears and disappears on its dates automatically.</p>
  {all.length?groups.filter(([,l])=>l.length).map(([h,l])=><section key={h} className="adm-group"><h2>{h}</h2><ul className="adm-promos">{l.map(p=>{const st=promoState(p);const [lab,cls]=LABEL[st];return <li key={p.id} className={'theme-'+p.theme}>
    <span className="adm-swatch" aria-hidden="true"/><span className="adm-promo-main"><small>{p.kind==='event'?'Event':'Promotion'}{p.eyebrow?' · '+p.eyebrow:''}</small><b>{p.title}</b><span>{fmt(p.start)} → {fmt(p.end)}</span></span>
    <span className={'adm-status s-'+cls}>{lab}</span>
    <span className="adm-promo-act"><a href={'/admin/promotions/'+p.id}>Edit</a><form action={togglePromoAction}><input type="hidden" name="id" value={p.id}/><button className="adm-clear">{p.active?'Switch off':'Switch on'}</button></form></span></li>;})}</ul></section>)
  :<section className="adm-card adm-empty"><h2>No promotions yet</h2><p className="adm-muted">Add Black Friday, a Christmas delivery deadline or a showroom open day. It appears on the homepage on its start date.</p><a className="pill" href="/admin/promotions/new">Add the first one <span aria-hidden="true">+</span></a></section>}
 </AdminShell>;
}
