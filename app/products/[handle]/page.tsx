import {notFound} from 'next/navigation';import StoreShell from '@/components/StoreShell';import {product,products,connected,money} from '@/lib/shopify';import {addToCart} from '@/app/actions';import ProductGallery from '@/components/ProductGallery';import QuantityPicker from '@/components/QuantityPicker';
export async function generateMetadata({params}:{params:Promise<{handle:string}>}){const {handle}=await params;const p=await product(handle);return {title:p?.title||'Product not found',description:p?.description.slice(0,155),alternates:{canonical:'/products/'+handle}};}
export default async function Detail({params}:{params:Promise<{handle:string}>}){const {handle}=await params;const p=await product(handle);if(!p)notFound();
 const related=(await products()).filter(x=>x.category===p.category&&x.handle!==p.handle&&x.images.length).slice(0,4);
 const options=p.variants.length?p.variants:[{id:'as-shown',title:'As shown',availableForSale:true,price:{amount:p.price||'0',currencyCode:p.currency}}];
 const many=options.length>1;
 return <StoreShell>{connected&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Product",name:p.title,description:p.description,image:p.images.map(i=>i.url),offers:p.variants.map(v=>({"@type":"Offer",price:v.price.amount,priceCurrency:v.price.currencyCode,availability:v.availableForSale?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:(process.env.NEXT_PUBLIC_SITE_URL||"")+"/products/"+p.handle}))}).replace(/</g,"\\u003c")}}/>}
 <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href={'/shop?category='+encodeURIComponent(p.category)}>{p.category}</a> / {p.title}</nav>
 <div className="detail-layout">
  <ProductGallery images={p.images} title={p.title}/>
  <section className="detail-copy">
   <p className="eyebrow">{p.category}</p>
   <h1>{p.title}</h1>
   <p className="detail-price">{p.price===null?'Enquire for pricing':(many?'From ':'')+money(p.price,p.currency)}</p>
   <p className="tax-note">{p.price===null?'Pricing to be confirmed.':connected?'Including VAT. Shipping is calculated at checkout.':'Including VAT. Archived price, to be confirmed before launch.'}</p>
   <p className="detail-lead"><strong>{p.category}</strong></p>
   <form action={connected?addToCart:undefined}>
    <label htmlFor="variant">Product option</label>
    <select id="variant" name="variant" required>{options.map(v=><option key={v.id} value={v.id} disabled={connected&&!v.availableForSale}>{v.title}{many?' — '+money(v.price.amount,v.price.currencyCode):''}{connected&&!v.availableForSale?' · Sold out':''}</option>)}</select>
    {!connected&&<p className="option-note">Final availability, option combinations and pricing will be confirmed before launch.</p>}
    <label htmlFor="quantity">Quantity</label>
    <QuantityPicker/>
    <button className="pill detail-add" type={connected?'submit':'button'} disabled={connected?!p.variants.some(v=>v.availableForSale):false} data-preview={connected?undefined:'true'}>Add to basket <span aria-hidden="true">↗</span></button>
    <a className="detail-basket-link" href="/cart">View basket ↗</a>
    <p className="purchase-note">{connected?'Secure payment through Shopify. Shipping and taxes are calculated at checkout.':'Preview basket only. Payments and orders are not connected yet.'}</p>
   </form>
   <details className="product-accordion" open><summary>About this product</summary><p>{p.description}</p></details>
   <details className="product-accordion"><summary>Delivery &amp; returns</summary><p>Delivery options and costs are shown at checkout. Bespoke and made-to-order items are confirmed with you before dispatch.</p></details>
   <details className="product-accordion"><summary>Need help choosing?</summary><p>Call <a href="tel:01661871481">01661 871481</a> to discuss sizes, suitability and bespoke installations.</p></details>
  </section>
 </div>
 {related.length>0&&<section className="related-products"><p className="eyebrow">You may also like</p><h2>More {p.category.toLowerCase()}</h2><div className="shop-grid">{related.map(r=>{const im=r.images[0];const cut=!!im?.cutout;const href='/products/'+r.handle;return <article className="shop-card" key={r.id}><div className={'sculpture '+(cut?'has-cutout':'photo-sculpture')}><a className="sculpture-link" href={href} aria-label={r.title}><span className="arched-backplate"/><span className="stone-plinth"/><img className="sculpture-plant" src={im.url} alt={r.title} loading="lazy"/></a><a className="quick-look" href={href} aria-label={'View '+r.title}>+</a></div><a className="shop-name" href={href}>{r.title}</a><div className="shop-card-bottom"><strong>{r.price===null?'Enquire for pricing':(r.variants.length>1?'From ':'')+money(r.price,r.currency)}</strong><a href={href}>View options ↗</a></div></article>})}</div></section>}
 </StoreShell>}
