import {staffLogout} from '@/app/admin/actions';import type {User} from '@/lib/auth';
const NAV:[string,string,string[]?][]=[['/admin','Dashboard'],['/admin/orders','Orders'],['/admin/products','Products'],['/admin/discounts','Discounts',['owner','admin']],['/admin/promotions','Promotions & events'],['/admin/email','Email',['owner','admin','editor']],['/admin/blog','Blog'],['/admin/enquiries','Enquiries'],['/admin/projects','Projects'],['/admin/care','Plant care'],['/admin/homepage','Homepage products'],['/admin/customers','Customers',['owner','admin']],['/admin/import','Data import',['owner','admin']],['/admin/team','Team',['owner','admin']],['/admin/security','Security'],['/admin/settings','Settings']];
const SOON=['SEO & redirects'];
export default function AdminShell({user,active,title,eyebrow,actions,children}:{user:User;active:string;title:string;eyebrow?:string;actions?:React.ReactNode;children:React.ReactNode}){
 return <div className="adm">
  <aside className="adm-side" aria-label="Admin navigation">
   <a className="adm-logo" href="/admin"><img src="/assets/replica-landscapes-heritage.webp" alt="Replica Landscapes"/><span>Admin</span></a>
   <nav>{NAV.filter(([, ,r])=>!r||r.includes(user.role)).map(([h,l])=><a key={h} href={h} aria-current={active===h||(h!=='/admin'&&active.startsWith(h))?'page':undefined}>{l}</a>)}</nav>
   <p className="adm-soon-h">Coming next</p><ul className="adm-soon">{SOON.map(s=><li key={s}>{s}</li>)}</ul>
   <div className="adm-me"><b>{user.name}</b><span>{user.role.charAt(0).toUpperCase()+user.role.slice(1)} · {user.email}</span><div className="adm-me-actions"><a href="/" target="_blank" rel="noopener">View website ↗</a><form action={staffLogout}><button>Sign out</button></form></div></div>
  </aside>
  <main className="adm-main">{user.tfa!=='on'&&active!=='/admin/security'&&<a className="adm-tfa-nudge" href="/admin/security">Protect your sign-in: turn on two-step sign-in ↗</a>}<div className="adm-top"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>{actions}</div>{children}</main>
 </div>;
}
export function AdmNotice({kind='ok',children}:{kind?:'ok'|'error';children:React.ReactNode}){return <p className={'auth-notice '+kind} role={kind==='error'?'alert':'status'}>{children}</p>;}
