import StoreShell from '@/components/StoreShell';
import GiftCard from '@/components/GiftCard';
import {EdHero} from '@/components/Editorial';
export const metadata={title:'Gift cards – artificial plants & trees gift vouchers',description:'Give the gift of greenery that lasts. Replica Landscapes digital gift cards from £10 to £1,000, personalised and emailed on the day you choose. Spend on artificial trees, plants and flowers.',alternates:{canonical:'/gift-cards'},openGraph:{title:'Replica Landscapes gift cards',description:'Personalised digital gift cards for lifelike artificial trees, plants and flowers.'}};
const FAQ:[string,string][]=[
 ['How are gift cards delivered?','By email, on the date you choose. You can send it to yourself to print or hand over in person.'],
 ['How long is a gift card valid?','Two years from the date it is sent.'],
 ['What can it be spent on?','Anything in our online shop, including artificial trees, plants, flowers, hedging and planters. It can be used across more than one order.'],
 ['Can I choose any amount?','Choose from £25 to £250, or enter your own amount between £10 and £1,000.'],
];
export default function GiftCards(){const ld={"@context":"https://schema.org","@type":"FAQPage",mainEntity:FAQ.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 return <StoreShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <div className="our-story-page ed-page">
   <EdHero crumbs={[['Home','/'],['Gift cards']]} eyebrow="REPLICA LANDSCAPES GIFT CARDS" title={['A gift that',<em key="e">stays green.</em>]}
    lead="Personalised digital gift cards from £10 to £1,000, sent by email on the day you choose." link={<a className="text-link" href="#design">Design your card ↓</a>}/>
   <div id="design"><GiftCard/></div>
   <section className="story-editorial ed-faq"><div><p className="eyebrow">GOOD TO KNOW</p><h2>Gift cards,<br/><em>simply explained.</em></h2></div>
    <div className="faq-list">{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  </div>
 </StoreShell>;}
