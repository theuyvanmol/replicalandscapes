import StoreShell from '@/components/StoreShell';
import {EdHero,GImg} from '@/components/Editorial';
import {TOPICS} from '@/lib/enquiries';
import {sendEnquiry} from './actions';
export const metadata={title:'Contact us – artificial plants, trees & bespoke installations',description:'Get in touch with Replica Landscapes about artificial trees, plants, hedging, living walls and bespoke installations. Call 01661 871 481 or send us a message.',alternates:{canonical:'/contact'}};
const ERR:Record<string,string>={required:'Please add your name and a short message.',email:'Please check your email address.',busy:'Too many messages in a short time. Please try again in a few minutes, or call us.',offline:'Messages can’t be sent right now. Please call or email us instead.'};
export default async function Contact({searchParams}:{searchParams:Promise<{sent?:string;e?:string;topic?:string}>}){
 const {sent,e,topic}=await searchParams;const pick=TOPICS.includes(topic||'')?topic:'General question';
 const ld={"@context":"https://schema.org","@type":"ContactPage",name:'Contact Replica Landscapes',mainEntity:{"@type":"LocalBusiness",name:'Replica Landscapes',legalName:'Office & Reception Planters Ltd',telephone:'+44 1661 871481',email:'sales@replicaplants.co.uk',address:{"@type":"PostalAddress",streetAddress:'Ash Tree Farm',addressLocality:'Heddon on the Wall',addressRegion:'Northumberland',postalCode:'NE15 0HE',addressCountry:'GB'},areaServed:'GB'}};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <div className="our-story-page ed-page">
   <EdHero crumbs={[['Home','/'],['Contact']]} eyebrow="CONTACT REPLICA LANDSCAPES" title={['Let’s talk',<em key="e">greenery.</em>]}
    lead="A single tree, a question about an order or a complete installation. Our team is here to help." link={<a className="text-link" href="tel:+441661871481">Call 01661 871 481 ↗</a>}/>
   <section className="ed-contact" id="form">
    <div className="ed-contact-info">
     <div className="ed-contact-block"><p className="eyebrow">01 / CALL US</p><a className="ed-big" href="tel:+441661871481">01661 871 481</a><p>Speak to the team about products, sizing or a project.</p></div>
     <div className="ed-contact-block"><p className="eyebrow">02 / EMAIL</p><a className="ed-big" href="mailto:sales@replicaplants.co.uk">sales@replicaplants.co.uk</a><p>Send photos and measurements for bespoke work.</p></div>
     <div className="ed-contact-block"><p className="eyebrow">03 / FIND US</p><address>Ash Tree Farm<br/>Heddon on the Wall<br/>Newcastle upon Tyne<br/>NE15 0HE</address><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Ash+Tree+Farm+Heddon+on+the+Wall+NE15+0HE" target="_blank" rel="noopener">Open in Google Maps ↗</a></div>
     <figure className="ed-contact-figure"><GImg slug="lit-artificial-olive-trees-courtyard" sizes="(max-width:900px) 100vw, 40vw"/><figcaption>OLIVE TREES / PRIVATE COURTYARD</figcaption></figure>
    </div>
    <div className="ed-form-wrap">
     {sent?<div className="ed-sent" role="status"><p className="eyebrow">MESSAGE RECEIVED</p><h2>Thank you.<br/><em>We’ll be in touch.</em></h2><p>A member of the team will reply as soon as possible, usually within one working day. For anything urgent, call 01661 871 481.</p><a className="text-link" href="/gallery">Browse our projects while you wait ↗</a></div>:
     <form action={sendEnquiry} className="ed-form">
      <p className="eyebrow">SEND US A MESSAGE</p><h2>How can<br/><em>we help?</em></h2>
      {e&&ERR[e]&&<p className="ed-err" role="alert">{ERR[e]}</p>}
      <fieldset className="ed-topics"><legend>What is it about?</legend>{TOPICS.map(t=><label key={t}><input type="radio" name="topic" value={t} defaultChecked={t===pick}/><span>{t}</span></label>)}</fieldset>
      <div className="ed-row"><label>Your name<input name="name" required autoComplete="name"/></label><label>Email<input name="email" type="email" required autoComplete="email"/></label></div>
      <label>Phone <span>Optional</span><input name="phone" type="tel" autoComplete="tel"/></label>
      <label>Message<textarea name="message" rows={6} required placeholder="Tell us about your space, the products you’re interested in or your order number."/></label>
      <label className="ed-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <input type="hidden" name="from" value="/contact"/>
      <div className="ed-form-foot"><button className="pill">Send message <span>↗</span></button><p>We’ll only use your details to reply to your enquiry.</p></div>
     </form>}
    </div>
   </section>
   <section className="ed-quick"><a href="/installation-service"><span className="editorial-number">BESPOKE PROJECTS</span><b>Our installation service</b><span className="text-link">How we work ↗</span></a><a href="/gallery"><span className="editorial-number">INSPIRATION</span><b>The project gallery</b><span className="text-link">See our work ↗</span></a><a href="/gift-cards"><span className="editorial-number">GIFTING</span><b>Gift cards</b><span className="text-link">Design a card ↗</span></a></section>
  </div></StoreShell>;
}
