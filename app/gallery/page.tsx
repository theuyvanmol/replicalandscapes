import StoreShell from '@/components/StoreShell';
import GalleryGrid from '@/components/GalleryGrid';
import {GALLERY,GALLERY_CATS} from '@/lib/gallery';
export const metadata={title:'Project gallery – artificial trees, living walls & hedging installed',description:'See our artificial trees, blossom canopies, living walls and boxwood hedging installed in restaurants, hotels, shops, offices and homes across the UK and Europe.',alternates:{canonical:'/gallery'},openGraph:{title:'Replica Landscapes project gallery',description:'Artificial trees, living walls and hedging installed in real spaces.',images:[{url:'/gallery/img/'+GALLERY[0].slug+'.webp',width:GALLERY[0].w,height:GALLERY[0].h,alt:GALLERY[0].alt}]}};
export default function Gallery(){const base=process.env.NEXT_PUBLIC_SITE_URL||'';
 const ld={"@context":"https://schema.org","@type":"ImageGallery",name:'Replica Landscapes project gallery',description:metadata.description,url:base+'/gallery',image:GALLERY.map(g=>({"@type":"ImageObject",contentUrl:base+'/gallery/img/'+g.slug+'.webp',thumbnailUrl:base+'/gallery/img/'+g.slug+'-sm.webp',name:g.title,caption:g.alt,width:g.w,height:g.h,creditText:'Replica Landscapes'}))};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Gallery</nav>
  <div className="store-heading gl-heading"><p className="eyebrow">Our work, in situ</p><h1>Project gallery.</h1><p>Artificial trees, blossom canopies, living walls and hedging, designed, built and installed by our team for restaurants, hotels, shops, offices and homes.</p></div>
  <GalleryGrid items={GALLERY} cats={GALLERY_CATS}/>
  <section className="gl-cta"><p className="eyebrow">Planning a space?</p><h2>Let&rsquo;s create yours.</h2><p>Every project here started with a conversation. Tell us about your space and we&rsquo;ll design planting that fits it perfectly.</p><div><a className="pill" href="/installation-service">Our installation service ↗</a><a className="pill" href="tel:01661871481">Call 01661 871 481</a></div></section>
 </StoreShell>;}
