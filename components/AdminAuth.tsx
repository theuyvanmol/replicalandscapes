export default function AdminAuth({title,lead,children}:{title:React.ReactNode;lead:string;children:React.ReactNode}){
 return <div className="adm-auth"><div className="adm-auth-card"><a className="adm-auth-logo" href="/"><img src="/assets/replica-landscapes-heritage.webp" alt="Replica Landscapes"/></a><p className="eyebrow">Team area</p><h1>{title}</h1><p className="auth-lead">{lead}</p>{children}</div><p className="adm-auth-foot">Customers: <a href="/account/login">sign in to your account here ↗</a></p></div>;
}
