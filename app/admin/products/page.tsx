import AdminShell from '@/components/AdminShell';import {requireStaff} from '@/lib/auth';import {products,connected,money} from '@/lib/shopify';import {adminReady} from '@/lib/shopify-admin';
export const metadata={title:'Products · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const PER=40;
export default async function Products({searchParams}:{searchParams:Promise<{q?:string;cat?:string;page?:string}>}){
 const u=await requireStaff();const {q='',cat='',page='1'}=await searchParams;
 const all=await products();const cats=[...new Set(all.map(p=>p.category))].sort();
 const list=all.filter(p=>(!cat||p.category===cat)&&(!q||(p.title+' '+p.handle).toLowerCase().includes(q.toLowerCase())));
 const n=Math.max(1,Math.min(Math.ceil(list.length/PER),Number(page)||1));const rows=list.slice((n-1)*PER,n*PER);
 const qs=(o:Record<string,string|number>)=>'?'+new URLSearchParams({...(q?{q}:{}),...(cat?{cat}:{}),...Object.fromEntries(Object.entries(o).map(([k,v])=>[k,String(v)]))}).toString();
 return <AdminShell user={u} active="/admin/products" eyebrow={list.length+' of '+all.length+' products'} title="Products">
  {!connected&&<p className="adm-banner">You’re viewing the catalogue from the Visualsoft backup (the 651 products marked Keep). Editing, stock and new products switch on here once Shopify is connected.</p>}
  <form className="adm-filters" role="search"><input name="q" defaultValue={q} placeholder="Search products" aria-label="Search products"/><select name="cat" defaultValue={cat} aria-label="Category"><option value="">All categories</option>{cats.map(c=><option key={c}>{c}</option>)}</select><button className="adm-btn">Filter</button>{(q||cat)&&<a className="adm-clear" href="/admin/products">Clear</a>}</form>
  <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th></th><th>Product</th><th>Category</th><th>Options</th><th className="num">Price</th><th></th></tr></thead><tbody>
   {rows.map(p=><tr key={p.id}><td className="thumb">{p.images[0]&&<img src={p.images[0].url} alt="" loading="lazy"/>}</td><td><b>{p.title}</b><span>{p.id.startsWith('gid:')?p.handle:p.id.replace('vs-','#')}</span></td><td>{p.category}</td><td>{p.variants.length}</td><td className="num">{p.price===null?'On request':(p.variants.length>1?'from ':'')+money(p.price,p.currency)}</td><td>{adminReady&&p.id.startsWith('gid://shopify/Product/')&&<a href={'/admin/products/'+p.id.split('/').pop()}>Edit</a>} <a href={'/products/'+p.handle} target="_blank" rel="noopener">View ↗</a></td></tr>)}
  </tbody></table></div>
  {list.length>PER&&<nav className="adm-pages" aria-label="Pages">{Array.from({length:Math.ceil(list.length/PER)},(_,i)=><a key={i} href={qs({page:i+1})} aria-current={i+1===n?'page':undefined}>{i+1}</a>)}</nav>}
 </AdminShell>;
}
