import {cookies} from 'next/headers';import StoreShell from '@/components/StoreShell';import {getCart,connected,money} from '@/lib/shopify';import {changeLine,checkout,applyCode,removeCode} from '@/app/actions';
import {homeProducts} from '@/lib/home-products';import {homepagePromos,promoState} from '@/lib/content';
export const metadata={title:'Your basket',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const FREE=100;
const sized=(u:string,w:number)=>/cdn\.shopify\.com/.test(u)?u+(u.includes('?')?'&':'?')+'width='+w:u;
const n=(m?:{amount:string}|null)=>m?Number(m.amount):0;
export default async function Cart({searchParams}:{searchParams:Promise<{code?:string;c?:string}>}){
 const {code:codeMsg,c}=await searchParams;
 const id=(await cookies()).get('replica-cart')?.value;const cart:any=connected&&id?await getCart(id).catch(()=>null):null;
 const [recs,promos]=await Promise.all([homeProducts().catch(()=>null),homepagePromos().catch(()=>[])]);
 const promo=promos.find(p=>p.code&&promoState(p)==='live');
 const lines:any[]=cart?.lines?.nodes||[];const count=cart?.totalQuantity||0;
 const inBasket=new Set(lines.map(l=>l.merchandise.product.handle));
 const suggest=(recs?.best||[]).concat(recs?.arrivals||[]).filter((p,i,a)=>!inBasket.has(p.handle)&&a.findIndex(x=>x.handle===p.handle)===i).slice(0,4);
 const cur=cart?.cost?.subtotalAmount?.currencyCode||'GBP';
 const before=lines.reduce((t,l)=>t+n(l.cost.amountPerQuantity)*l.quantity,0);
 const lineDisc=lines.reduce((t,l)=>t+(l.discountAllocations||[]).reduce((s:number,d:any)=>s+n(d.discountedAmount),0),0);
 const orderDisc=(cart?.discountAllocations||[]).reduce((s:number,d:any)=>s+n(d.discountedAmount),0);
 const saved=lineDisc+orderDisc;const total=n(cart?.cost?.totalAmount);const sub=n(cart?.cost?.subtotalAmount);
 const toFree=Math.max(0,FREE-sub);const pct=Math.min(100,Math.round(sub/FREE*100));
 const codes:any[]=(cart?.discountCodes||[]).filter((x:any)=>x.applicable);
 const promoApplied=promo&&codes.some(x=>x.code.toUpperCase()===promo.code.toUpperCase());
 return <StoreShell><div className="our-story-page bk">
  <section className="bk-head">
   <nav className="story-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Basket</span></nav>
   <p className="eyebrow">YOUR CONSIDERED EDIT</p>
   <h1>Your <em>basket.</em></h1>
   {count>0&&<p className="bk-count">{count} {count===1?'piece':'pieces'} of lasting greenery</p>}
  </section>

  {!count?<section className="bk-empty">
   <div><p className="intro-lead">{connected?'Nothing here yet. Our most loved trees and plants are a good place to start.':'The shop is being connected. Please check back shortly.'}</p>
    <div className="bk-empty-links"><a className="pill" href="/shop">Explore the collection <span>↗</span></a><a className="text-link" href="/#favourites">See best sellers ↗</a></div></div>
  </section>:<>
  {promo&&!promoApplied&&<form action={applyCode} className={'bk-promo theme-'+promo.theme}><input type="hidden" name="code" value={promo.code}/>
   <span className="bk-promo-tag">{promo.badge||promo.eyebrow||'OFFER'}</span><span className="bk-promo-text"><b>{promo.title}</b> Use code <code>{promo.code}</code></span><button className="bk-promo-btn">Apply to my basket ↗</button></form>}

  <div className="bk-layout">
   <div className="bk-lines">
    <div className={'bk-free'+(toFree===0?' is-done':'')} role="status">
     <p>{toFree===0?<><b>Free UK delivery</b> is unlocked for your order.</>:<>You’re <b>{money(String(toFree),cur)}</b> away from <b>free UK mainland delivery</b>.</>}</p>
     <span className="bk-bar" aria-hidden="true"><i style={{width:pct+'%'}}/></span>
    </div>
    {lines.map(l=>{const v=l.merchandise;const img=v.image?.url||v.product.featuredImage?.url;const unit=n(l.cost.amountPerQuantity);const was=n(l.cost.compareAtAmountPerQuantity);const disc=(l.discountAllocations||[]).reduce((s:number,d:any)=>s+n(d.discountedAmount),0);
     return <article className="bk-line" key={l.id}>
      <a className="bk-img" href={'/products/'+v.product.handle}>{img&&<img src={sized(img,360)} alt={v.image?.altText||v.product.title} loading="lazy"/>}</a>
      <div className="bk-info">
       <a className="bk-title" href={'/products/'+v.product.handle}>{v.product.title}</a>
       {v.title&&v.title!=='Default Title'&&<p className="bk-variant">{v.title}</p>}
       <p className="bk-unit">{money(String(unit),cur)}{was>unit&&<s>{money(String(was),cur)}</s>} each</p>
       {!v.availableForSale&&<p className="bk-warn">Currently out of stock: we’ll confirm a date before dispatch.</p>}
       <div className="bk-actions">
        <form action={changeLine} className="bk-qty"><input type="hidden" name="line" value={l.id}/>
         <button name="quantity" value={l.quantity-1} aria-label="One fewer">−</button><span aria-live="polite">{l.quantity}</span><button name="quantity" value={Math.min(99,l.quantity+1)} aria-label="One more">+</button></form>
        <form action={changeLine}><input type="hidden" name="line" value={l.id}/><button className="bk-remove" name="quantity" value="0">Remove</button></form>
       </div>
      </div>
      <div className="bk-price">{disc>0&&<s>{money(String(unit*l.quantity),cur)}</s>}<b>{money(String(unit*l.quantity-disc),cur)}</b></div>
     </article>;})}
   </div>

   <aside className="bk-summary" aria-label="Order summary">
    <p className="eyebrow">ORDER SUMMARY</p>
    <dl>
     <div><dt>Items</dt><dd>{money(String(before),cur)}</dd></div>
     {saved>0&&<div className="bk-save"><dt>Discount</dt><dd>−{money(String(saved),cur)}</dd></div>}
     <div><dt>Delivery</dt><dd>{toFree===0?'Free':'From £7.95'}</dd></div>
     <div className="bk-total"><dt>Total</dt><dd>{money(String(total),cur)}</dd></div>
    </dl>
    <p className="bk-note">Prices include VAT. Delivery is confirmed at checkout.</p>
    <form action={checkout}><button className="pill bk-checkout">Secure checkout <span>↗</span></button></form>
    <details className="bk-code" open={!!codeMsg||codes.length>0}>
     <summary>Have a discount code?</summary>
     {codes.map(x=><form action={removeCode} key={x.code} className="bk-chip"><input type="hidden" name="code" value={x.code}/><span>{x.code}</span><button aria-label={'Remove '+x.code}>×</button></form>)}
     <form action={applyCode} className="bk-code-form"><input name="code" placeholder="Enter code" aria-label="Discount code" autoComplete="off" defaultValue={codeMsg==='invalid'?c:''}/><button>Apply</button></form>
     {codeMsg==='invalid'&&<p className="bk-msg is-error" role="alert">“{c}” isn’t valid for this basket. Check the spelling, dates or minimum spend.</p>}
     {codeMsg==='ok'&&<p className="bk-msg" role="status">“{c}” has been applied.</p>}
     {codeMsg==='empty'&&<p className="bk-msg is-error" role="alert">Enter a code first.</p>}
    </details>
    <ul className="bk-trust">
     <li><b>Secure payment</b><span>Card, Apple Pay, Google Pay &amp; PayPal</span></li>
     <li><b>Tracked delivery</b><span>Usually 3–5 working days</span></li>
     <li><b>14-day returns</b><span>Change of mind, no problem</span></li>
     <li><b>Real people</b><span><a href="tel:+441661871481">01661 871 481</a></span></li>
    </ul>
   </aside>
  </div></>}

  {suggest.length>0&&<section className="bk-recs"><div className="bk-recs-head"><p className="eyebrow">{count?'COMPLETE THE LOOK':'MOST LOVED'}</p><h2>You might <em>also like.</em></h2></div>
   <div className="bk-rec-grid">{suggest.map(p=><a key={p.handle} className={'bk-rec'+(p.cutout?' is-cutout':'')} href={'/products/'+p.handle}><span className="bk-rec-img">{p.image&&<img src={sized(p.image,520)} alt={p.name} loading="lazy"/>}</span><b>{p.name}</b><span>{p.price!==null?(p.from?'From ':'')+money(String(p.price),'GBP'):'Price on request'}</span></a>)}</div></section>}
 </div></StoreShell>;
}
