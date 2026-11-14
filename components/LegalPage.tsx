import StoreShell from '@/components/StoreShell';import {EdHero,EdFinal} from '@/components/Editorial';
export type LegalSection=[string,React.ReactNode];
export default function LegalPage({crumb,title,lead,updated,sections}:{crumb:string;title:React.ReactNode[];lead:string;updated:string;sections:LegalSection[]}){
 return <StoreShell><div className="our-story-page ed-page legal-page">
  <EdHero crumbs={[['Home','/'],[crumb]]} eyebrow="THE SMALL PRINT" title={title} lead={lead} link={<span className="legal-updated">Last updated {updated}</span>}/>
  <nav className="legal-toc" aria-label="On this page"><p className="eyebrow">ON THIS PAGE</p><ol>{sections.map(([h],i)=><li key={h}><a href={'#s'+(i+1)}>{h}</a></li>)}</ol></nav>
  <div className="legal-body">{sections.map(([h,body],i)=><section key={h} id={'s'+(i+1)}><span className="editorial-number">{String(i+1).padStart(2,'0')}</span><h2>{h}</h2><div className="legal-text">{body}</div></section>)}</div>
  <EdFinal eyebrow="QUESTIONS?" title={<>Talk to<br/>a real person.</>} text="If anything here is unclear, call or email the team and we’ll explain."><a className="pill" href="/contact">Contact us <span>↗</span></a><a className="text-link" href="tel:+441661871481">Call 01661 871 481 ↗</a></EdFinal>
 </div></StoreShell>;
}
export const COMPANY=<>Office &amp; Reception Planters Ltd, trading as Replica Landscapes (previously The Artificial Plants Shop and Replica Plants), Ash Tree Farm, Heddon-on-the-Wall, Newcastle upon Tyne NE15 0HE. VAT number 890858276.</>;
