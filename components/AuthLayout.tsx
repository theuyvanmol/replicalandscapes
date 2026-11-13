import StoreShell from '@/components/StoreShell';
export default function AuthLayout({eyebrow,title,lead,children,aside}:{eyebrow:string;title:React.ReactNode;lead:string;children:React.ReactNode;aside?:React.ReactNode}){
 return <StoreShell><div className="auth-page">
  <div className="auth-visual" aria-hidden="true"><div className="auth-arch"><img src="/assets/olive-scene.webp" alt=""/></div>{aside||<p className="auth-quote">“Lifelike by design.<br/>Beautiful by nature.”</p>}</div>
  <section className="auth-panel"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="auth-lead">{lead}</p>{children}</section>
 </div></StoreShell>;
}
export function Notice({kind='error',children}:{kind?:'error'|'ok';children:React.ReactNode}){return <p className={'auth-notice '+kind} role={kind==='error'?'alert':'status'}>{children}</p>;}
