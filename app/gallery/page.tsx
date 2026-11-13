import StoreShell from '@/components/StoreShell';
import GalleryGrid from '@/components/GalleryGrid';
import {EdHero,EdFinal} from '@/components/Editorial';
import {GALLERY,GALLERY_CATS} from '@/lib/gallery';
export const metadata={title:'Project gallery – artificial trees, living walls & hedging installed',description:'See our artificial trees, blossom canopies, living walls and boxwood hedging installed in restaurants, hotels, shops, offices and homes across the UK and Europe.',alternates:{canonical:'/gallery'},openGraph:{title:'Replica Landscapes project gallery',description:'Artificial trees, living walls and hedging installed in real spaces.',images:[{url:'/gallery/img/'+GALLERY[0].slug+'.webp',width:GALLERY[0].w,height:GALLERY[0].h,alt:GALLERY[0].alt}]}};
export default function Gallery(){const base=process.env.NEXT_PUBLIC_SITE_URL||'';
 const ld={"@context":"https://schema.org","@type":"ImageGallery",name:'Replica Landscapes project gallery',description:metadata.description,url:base+'/gallery',image:GALLERY.map(g=>({"@type":"ImageObject",contentUrl:base+'/gallery/img/'+g.slug+'.webp',thumbnailUrl:base+'/gallery/img/'+g.slug+'-sm.webp',name:g.title,caption:g.alt,width:g.w,height:g.h,creditText:'Replica Landscapes'}))};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <div className="our-story-page ed-page">
   <EdHero crumbs={[['Home','/'],['Gallery']]} eyebrow="PROJECT GALLERY" title={['Our work,',<em key="e">in real spaces.</em>]}
    lead={`${GALLERY.length} photographs from installations in restaurants, hotels, shops, offices and homes, each designed, built and installed by our team.`} link={<a className="text-link" href="/contact?topic=Bespoke%20installation">Start a project ↗</a>}/>
   <GalleryGrid items={GALLERY} cats={GALLERY_CATS}/>
   <EdFinal title={<>Every project starts<br/>with a conversation.</>} text="Tell us about your space and we’ll design planting that fits it perfectly, from a single tree to a complete installation.">
    <a className="pill" href="/installation-service">Our installation service <span>↗</span></a><a className="text-link" href="/contact">Get in touch ↗</a><a className="text-link" href="tel:+441661871481">Call 01661 871 481 ↗</a></EdFinal>
  </div></StoreShell>;}
