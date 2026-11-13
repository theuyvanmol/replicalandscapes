import AdminShell,{AdmNotice} from '@/components/AdminShell';import ImageField from '@/components/ImageField';import {requireStaff} from '@/lib/auth';import {getPromo,isoToUkLocal,type Promo} from '@/lib/content';import {savePromoAction,deletePromoAction} from '@/app/admin/content-actions';import {notFound} from 'next/navigation';
export const metadata={title:'Edit promotion · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
const THEMES:[Promo['theme'],string][]=[['forest','Forest green'],['midnight','Midnight'],['terracotta','Terracotta'],['sage','Soft sage']];
const ERR:Record<string,string>={required:'Add a headline, a start and an end.',dates:'The end needs to be after the start.',confirm:'Tick the box to confirm you want to remove this.'};
export default async function EditPromo({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{e?:string}>}){
 const u=await requireStaff();const {id}=await params;const {e}=await searchParams;
 const isNew=id==='new';const p=isNew?null:await getPromo(id);if(!isNew&&!p)notFound();
 const now=new Date();const iso=(d:Date)=>d.toISOString();
 const v:Promo=p||{id:'',kind:'promotion',eyebrow:'Black Friday',title:'',text:'',badge:'',code:'',ctaLabel:'Shop the offers',ctaLink:'/shop',start:iso(now),end:iso(new Date(now.getTime()+7*864e5)),showEarly:false,active:true,theme:'midnight',image:'',ticker:'',updated:''};
 return <AdminShell user={u} active="/admin/promotions" eyebrow={isNew?'New':'Edit'} title={isNew?'Add a promotion or event':v.title} actions={<a className="adm-clear" href="/admin/promotions">← All promotions</a>}>
  {e&&ERR[e]&&<AdmNotice kind="error">{ERR[e]}</AdmNotice>}
  <form action={savePromoAction} className="adm-editor"><input type="hidden" name="id" value={v.id}/>
   <div className="adm-editor-main adm-card">
    <fieldset className="ed-kind"><legend>Type</legend><label><input type="radio" name="kind" value="promotion" defaultChecked={v.kind==='promotion'}/> Promotion <span>Sale, offer or discount code, with a countdown</span></label><label><input type="radio" name="kind" value="event" defaultChecked={v.kind==='event'}/> Event <span>Open day, delivery deadline, launch, with its date</span></label></fieldset>
    <label htmlFor="eyebrow">Small label <span>e.g. Black Friday, Christmas, Open day</span></label><input id="eyebrow" name="eyebrow" defaultValue={v.eyebrow}/>
    <label className="ed-title-l" htmlFor="title">Headline</label><input className="ed-title" id="title" name="title" defaultValue={v.title} placeholder="e.g. Up to 25% off statement trees" required/>
    <label htmlFor="text">Supporting line</label><textarea id="text" name="text" rows={2} defaultValue={v.text} placeholder="e.g. Plus free UK mainland delivery on every order this weekend."/>
    <div className="ed-row"><div><label htmlFor="badge">Badge <span>Short: −25%, Free delivery</span></label><input id="badge" name="badge" defaultValue={v.badge}/></div><div><label htmlFor="code">Discount code <span>Optional</span></label><input id="code" name="code" defaultValue={v.code}/></div></div>
    <div className="ed-row"><div><label htmlFor="ctaLabel">Button text</label><input id="ctaLabel" name="ctaLabel" defaultValue={v.ctaLabel}/></div><div><label htmlFor="ctaLink">Button link <span>e.g. /shop or /shop?category=Trees</span></label><input id="ctaLink" name="ctaLink" defaultValue={v.ctaLink}/></div></div>
    <label htmlFor="ticker">Moving ticker words <span>Separate with commas</span></label><input id="ticker" name="ticker" defaultValue={v.ticker} placeholder="Black Friday, Up to 25% off, Free UK delivery, Ends Monday"/>
   </div>
   <aside className="adm-editor-side">
    <section className="adm-card"><h2>When <span className="ed-tz">UK time</span></h2>
     <label htmlFor="start">Starts</label><input id="start" name="start" type="datetime-local" defaultValue={isoToUkLocal(v.start)} required/>
     <label htmlFor="end">Ends</label><input id="end" name="end" type="datetime-local" defaultValue={isoToUkLocal(v.end)} required/>
     <label className="auth-check"><input type="checkbox" name="showEarly" defaultChecked={v.showEarly}/> Show before it starts, as “coming soon”</label>
     <label className="auth-check"><input type="checkbox" name="active" defaultChecked={v.active}/> Switched on</label>
     <div className="ed-buttons"><button className="pill">{isNew?'Add to homepage':'Save changes'}</button></div></section>
    <section className="adm-card"><h2>Look</h2><fieldset className="ed-themes"><legend className="sr-only">Colour</legend>{THEMES.map(([k,l])=><label key={k} className={'theme-'+k}><input type="radio" name="theme" value={k} defaultChecked={v.theme===k}/><span/>{l}</label>)}</fieldset>
     <ImageField name="image" label="Photo (optional)" defaultValue={v.image} hint="Shown in an arch beside the headline."/></section>
   </aside>
  </form>
  {!isNew&&<form action={deletePromoAction} className="adm-danger"><input type="hidden" name="id" value={v.id}/><label><input type="checkbox" name="confirm" value="yes"/> Yes, remove this permanently</label><button className="adm-remove">Remove</button></form>}
 </AdminShell>;
}
