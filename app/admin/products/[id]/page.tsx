import {notFound} from 'next/navigation';
import AdminShell,{AdmNotice} from '@/components/AdminShell';import ShopNotConnected from '@/components/ShopNotConnected';import {requireStaff} from '@/lib/auth';
import {adminReady,shopAdminUrl} from '@/lib/shopify-admin';import {getAdminProduct} from '@/lib/shop-admin-data';import {saveProductAction} from '@/app/admin/shop-actions';
export const metadata={title:'Edit product · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const FLAGS=['Outdoor','Fire retardant','New arrival'];
const toText=(html:string)=>html.replace(/<li>/g,'• ').replace(/<\/li>/g,'\n').replace(/<\/p>|<\/ul>/g,'\n\n').replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\n{3,}/g,'\n\n').trim();
export default async function EditProduct({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;e?:string}>}){
 const u=await requireStaff(['owner','admin']);const {id}=await params;const {saved,e}=await searchParams;if(!/^\d{1,20}$/.test(id))notFound();
 if(!adminReady)return <AdminShell user={u} active="/admin/products" title="Edit product"><ShopNotConnected what="Product editing"/></AdminShell>;
 const p=await getAdminProduct('gid://shopify/Product/'+id).catch(()=>null);if(!p)notFound();
 const extra=p.tags.filter((t:string)=>!FLAGS.includes(t));
 return <AdminShell user={u} active="/admin/products" eyebrow={p.status==='ACTIVE'?'Live on the website':p.status==='DRAFT'?'Hidden (draft)':'Archived'} title={p.title} actions={<a className="adm-clear" href="/admin/products">← All products</a>}>
  {saved&&<AdmNotice>Saved to Shopify. The website updates within about two minutes.</AdmNotice>}{e&&<AdmNotice kind="error">{e}</AdmNotice>}
  <form action={saveProductAction} className="adm-editor"><input type="hidden" name="product" value={id}/>
   <div className="adm-editor-main">
    <section className="adm-card"><label className="ed-title-l">Product name<input className="ed-title" name="title" defaultValue={p.title} required/></label>
     <label>Description<textarea name="description" rows={12} defaultValue={toText(p.descriptionHtml||'')}/></label><p className="auth-hint">Leave a blank line between paragraphs. Start lines with “• ” for a bullet list.</p></section>
    <section className="adm-card"><h2>Sizes &amp; prices</h2><p className="adm-muted">“Was” price shows the product as on sale (it must be higher than the price).</p>
     <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Size / option</th><th>SKU</th><th>Price (£)</th><th>Was (£)</th></tr></thead><tbody>
      {p.variants.nodes.map((v:any)=>{const k=v.id.split('/').pop();return <tr key={v.id}><td><input type="hidden" name="variant" value={v.id}/>{v.title==='Default Title'?'Standard':v.title}</td><td>{v.sku||'–'}</td><td><input className="adm-price" name={'price_'+k} defaultValue={v.price} inputMode="decimal" required/></td><td><input className="adm-price" name={'compare_'+k} defaultValue={v.compareAtPrice||''} inputMode="decimal" placeholder="–"/></td></tr>;})}
     </tbody></table></div></section>
    <section className="adm-card"><h2>Google listing</h2><label>Page title<input name="seoTitle" maxLength={70} defaultValue={p.seo?.title||''} placeholder={p.title}/></label><label>Description<textarea name="seoDescription" rows={3} maxLength={320} defaultValue={p.seo?.description||''}/></label></section>
   </div>
   <aside className="adm-editor-side">
    <section className="adm-card">{p.featuredMedia?.preview?.image?.url&&<img className="adm-prod-img" src={p.featuredMedia.preview.image.url} alt=""/>}
     <label>Visibility<select name="status" defaultValue={p.status}><option value="ACTIVE">Live on the website</option><option value="DRAFT">Hidden (draft)</option><option value="ARCHIVED">Archived</option></select></label>
     <label>Category<input name="productType" defaultValue={p.productType}/></label>
     <fieldset className="adm-flags"><legend>Labels</legend>{FLAGS.map(f=><label key={f} className="auth-check"><input type="checkbox" name="tag" value={f} defaultChecked={p.tags.includes(f)}/> {f==='Outdoor'?'Suitable outdoors (UV)':f==='Fire retardant'?'Fire-retardant':'New arrival (homepage)'}</label>)}</fieldset>
     <label>Other tags <span>comma separated</span><input name="extraTags" defaultValue={extra.join(', ')}/></label>
     <button className="pill">Save changes</button>
     <a className="adm-clear" href={'/products/'+p.handle} target="_blank" rel="noopener">View on website ↗</a>
     <p className="auth-hint">Photos, new products and stock: <a href={shopAdminUrl('products/'+id)} target="_blank" rel="noopener">edit in Shopify ↗</a></p></section>
   </aside>
  </form>
 </AdminShell>;}
