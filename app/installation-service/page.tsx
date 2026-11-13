import StoreShell from '@/components/StoreShell';
import {EdHero,EdFinal,GImg} from '@/components/Editorial';
export const metadata={title:'Bespoke artificial plant design & installation service',description:'Bespoke artificial trees, living walls, ceiling canopies and boxwood hedging designed, built to size and installed by our own team. Fire-retardant and UV-protected options for UK businesses and homes.',alternates:{canonical:'/installation-service'},openGraph:{title:'Bespoke design & installation | Replica Landscapes',description:'Artificial trees, living walls and hedging built to size and installed by our own team.',images:['/gallery/img/pink-artificial-cherry-blossom-tree-restaurant.webp']}};
const STEPS:[string,string][]=[
 ['Consultation','We start by understanding your space, your vision and the practical details: light, footfall, fire ratings and access. Send photos and measurements, or we can visit.'],
 ['Design proposal','You receive a detailed proposal with plant selection, layout and planters, with visualisations so you can see the finished result before anything is made.'],
 ['Build & installation','Trees and hedging are built to size in our workshop, transported with care and installed by our own team, working around your opening hours to keep disruption to a minimum.'],
 ['Aftercare','We show you how to keep everything looking fresh, and we are on hand for cleaning, refreshes, seasonal changes and future additions.'],
];
const FAQ:[string,string][]=[
 ['Can you build artificial trees to a specific size?','Yes. Our bespoke trees are built to the height, spread and shape your space needs, from compact olive trees to a 6.2m oak tree and full ceiling canopies.'],
 ['Are your installations fire retardant?','We offer inherently fire retardant (IFR) foliage and can supply fire certificates for commercial projects. Let us know your building requirements at consultation.'],
 ['Can artificial plants go outside?','Yes. Our exterior range is UV protected to resist fading, and is used for terraces, roof gardens, hedging and shopfronts.'],
 ['Do you install outside the UK?','Yes. We are based in Northumberland and install across the UK, and have completed projects in Europe, including Monaco, and further afield.'],
 ['How long does a bespoke project take?','It depends on scale. Smaller projects can be designed and installed within a few weeks; large trees and canopies take longer to build. We will give you a clear timeline in your proposal.'],
 ['How do I get a quote?','Call 01661 871 481 or email sales@replicaplants.co.uk with photos, rough measurements and what you have in mind. We will come back with ideas and a quote.'],
];
const SECTORS:[string,string,string,string][]=[
 ['Hospitality','Restaurants, bars, hotels and lounges: statement blossom trees, foliage ceilings and terrace screening that set the mood from the first step inside.','artificial-foliage-ceiling-treehouse-bar','Hospitality'],
 ['Workplaces','Receptions, offices and meeting rooms that feel calm and welcoming, with fire-retardant planting that never needs watering.','fire-retardant-artificial-plant-trough-filler-office','Retail & shopfronts'],
 ['Retail','Window displays and shopfronts that stop people in their tracks, from boxwood frontages to seasonal blossom.','artificial-blossom-trees-window-display','Retail & shopfronts'],
 ['Residential','Courtyards, balconies, roof terraces and interiors that stay green all year, including UV-protected trees and privacy hedging.','artificial-birch-trees-cedar-screens','Residential'],
];
const PROJECTS:[string,string,string][]=[['large-artificial-oak-tree-6-2m','6.2M OAK TREE','Bespoke trees'],['curved-artificial-boxwood-hedge-trough-monaco','MONACO TERRACE','Hedging & screens'],['aveika-red-rose-artificial-living-wall','BRAND LIVING WALL','Living walls']];
export default function Installation(){const base=process.env.NEXT_PUBLIC_SITE_URL||'';
 const ld=[{"@context":"https://schema.org","@type":"Service",name:'Bespoke artificial plant design and installation',serviceType:'Artificial plant, tree and living wall installation',description:metadata.description,url:base+'/installation-service',areaServed:[{"@type":"Country",name:'United Kingdom'},{"@type":"Place",name:'Europe'}],provider:{"@type":"LocalBusiness",name:'Replica Landscapes',telephone:'+44 1661 871481',email:'sales@replicaplants.co.uk',address:{"@type":"PostalAddress",streetAddress:'Ash Tree Farm',addressLocality:'Heddon on the Wall',addressRegion:'Northumberland',postalCode:'NE15 0HE',addressCountry:'GB'}},hasOfferCatalog:{"@type":"OfferCatalog",name:'Installation services',itemListElement:['Bespoke artificial trees','Artificial blossom canopies','Artificial living walls','Artificial boxwood hedging','Artificial ceiling foliage'].map(n=>({"@type":"Offer",itemOffered:{"@type":"Service",name:n}}))}},
  {"@context":"https://schema.org","@type":"HowTo",name:'How our bespoke installation service works',step:STEPS.map(([n,t],i)=>({"@type":"HowToStep",position:i+1,name:n,text:t}))},
  {"@context":"https://schema.org","@type":"FAQPage",mainEntity:FAQ.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}];
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
 <div className="our-story-page ed-page">
  <EdHero crumbs={[['Home','/'],['Bespoke & commercial','/bespoke-commercial/'],['Installation service']]} eyebrow="BESPOKE DESIGN & INSTALLATION" title={['Made for your space.',<em key="e">Installed with care.</em>]}
   lead="From a single statement tree to a blossom canopy across an entire restaurant, our team designs, builds and installs lifelike planting made to fit." link={<a className="text-link" href="#enquire">Request a quote ↓</a>}
   figure={<GImg slug="pink-artificial-cherry-blossom-tree-restaurant" sizes="100vw" eager/>} caption="BESPOKE BLOSSOM CANOPY / RESTAURANT INSTALLATION"/>
  <ul className="ed-figures"><li><b>16+</b><span>Years of bespoke<br/>planting projects</span></li><li><b>15m</b><span>Our tallest tree, a gold-leaf<br/>apple tree for a shopping centre</span></li><li><b>IFR &amp; UV</b><span>Fire-retardant and<br/>outdoor-ready foliage</span></li></ul>
  <section className="story-editorial ed-steps-section" id="how-we-work"><div><p className="eyebrow">01 / HOW WE WORK</p><h2>Four steps.<br/><em>One considered result.</em></h2></div>
   <div><p className="intro-lead">Every project begins with a conversation and ends with planting that feels as though it has always belonged.</p>
    <ol className="ed-steps">{STEPS.map(([n,t],i)=><li key={n}><span>0{i+1}</span><div><h3>{n}</h3><p>{t}</p></div></li>)}</ol></div></section>
  <section className="ed-sectors" aria-labelledby="sectors"><div className="ed-section-head"><p className="eyebrow">02 / WHERE WE WORK</p><h2 id="sectors">Planting for every<br/><em>kind of space.</em></h2></div>
   {SECTORS.map(([h,t,s,c],i)=><a key={h} className="ed-sector" href={'/gallery?category='+encodeURIComponent(c)}><span className="ed-sector-n">0{i+1}</span><h3>{h}</h3><p>{t}</p><span className="ed-sector-img"><GImg slug={s} sizes="320px"/></span><span className="ed-sector-go" aria-hidden="true">↗</span></a>)}</section>
  <section className="story-project visual-project ed-why"><figure><GImg slug="lit-artificial-olive-trees-courtyard" sizes="100vw"/><figcaption>UPLIT OLIVE TREES / PRIVATE COURTYARD</figcaption></figure>
   <p className="eyebrow">03 / WHY BESPOKE</p><h2>Built to size.<br/><em>Made to last.</em></h2>
   <div><div><p>Every tree, hedge and canopy is built to the dimensions, shape and density your space needs, then finished on site by our own team. Large trees are transported protected and installed around your opening hours to keep disruption to a minimum.</p><p>Inherently fire-retardant foliage is available for hotels, offices, shops and restaurants, with UV-protected planting for terraces, roof gardens and shopfronts.</p></div>
    <ul className="ed-points"><li>Built to your exact dimensions</li><li>Fire-retardant options for public spaces</li><li>UV-protected for outdoor use</li><li>No watering, pruning or replacing</li><li>Installed by our own team</li><li>Aftercare and Leaf Clean maintenance</li></ul></div></section>
  <section className="ed-trio-section" aria-labelledby="projects"><div className="ed-section-head ed-head-row"><div><p className="eyebrow">04 / SELECTED PROJECTS</p><h2 id="projects">Recent work,<br/><em>in situ.</em></h2></div><a className="text-link" href="/gallery">View the full gallery ↗</a></div>
   <div className="ed-trio">{PROJECTS.map(([s,cap,cat],i)=><a key={s} className="ed-trio-card" href="/gallery"><span className="ed-trio-img"><GImg slug={s} sizes="(max-width:900px) 100vw, 33vw"/><span className="ed-tag">{cap}</span></span><span className="editorial-number">0{i+1} / {cat.toUpperCase()}</span></a>)}</div></section>
  <section className="story-editorial ed-faq"><div><p className="eyebrow">05 / GOOD TO KNOW</p><h2>Your questions.<br/><em>Considered answers.</em></h2></div>
   <div className="faq-list">{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  <div id="enquire"><EdFinal title={<>Tell us about<br/>your space.</>} text="Send us photos, rough measurements and what you have in mind. We’ll come back with ideas, a visual proposal and a clear quote.">
   <a className="pill" href="/contact?topic=Bespoke%20installation">Send an enquiry <span>↗</span></a><a className="text-link" href="tel:+441661871481">Call 01661 871 481 ↗</a><a className="text-link" href="mailto:sales@replicaplants.co.uk?subject=Bespoke%20installation%20enquiry">sales@replicaplants.co.uk ↗</a></EdFinal></div>
 </div></StoreShell>;}
