/* Who we are, for Google and AI assistants (schema.org). Facts only: address, phone, company details. */
export function businessLd(){const base=(process.env.NEXT_PUBLIC_SITE_URL||'').replace(/\/$/,'');
 const org={"@type":["Organization","Store"],"@id":base+'/#business',name:'Replica Landscapes',legalName:'Office & Reception Planters Ltd',alternateName:['The Artificial Plants Shop','Replica Plants'],url:base+'/',logo:base+'/assets/replica-landscapes-heritage.webp',image:base+'/assets/olive-scene.webp',
  description:'UK supplier of lifelike artificial trees, plants, topiary, flowers, hedging and living walls, with a bespoke design and installation service for homes and commercial spaces.',
  telephone:'+44 1661 871481',email:'sales@replicaplants.co.uk',vatID:'GB890858276',
  address:{"@type":"PostalAddress",streetAddress:'Ash Tree Farm, Heddon-on-the-Wall',addressLocality:'Newcastle upon Tyne',postalCode:'NE15 0HE',addressRegion:'Northumberland',addressCountry:'GB'},
  areaServed:{"@type":"Country",name:'United Kingdom'},priceRange:'££',currenciesAccepted:'GBP',paymentAccepted:'Credit card, debit card, PayPal, Apple Pay, Google Pay',
  sameAs:['https://artificialplants.co.uk','https://replicaplants.co.uk']};
 const site={"@type":"WebSite","@id":base+'/#website',url:base+'/',name:'Replica Landscapes',publisher:{"@id":base+'/#business'},potentialAction:{"@type":"SearchAction",target:{"@type":"EntryPoint",urlTemplate:base+'/shop?q={search_term_string}'},"query-input":"required name=search_term_string"}};
 return JSON.stringify({"@context":"https://schema.org","@graph":[org,site]}).replace(/</g,'\\u003c');}
