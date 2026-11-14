import AdminShell,{AdmNotice} from '@/components/AdminShell';import HomePicker from '@/components/HomePicker';import {requireStaff} from '@/lib/auth';
import {getPicks} from '@/lib/home-products';import {pickList} from '@/lib/plant-catalogue';import {connected} from '@/lib/shopify';import {saveHomePicks} from './actions';
export const metadata={title:'Homepage products · Admin',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function HomeAdmin({searchParams}:{searchParams:Promise<{saved?:string}>}){const u=await requireStaff(['owner','admin']);const {saved}=await searchParams;const [picks,items]=await Promise.all([getPicks(),pickList()]);
 return <AdminShell user={u} active="/admin/homepage" eyebrow="Homepage" title="Homepage products">
  {saved&&<AdmNotice>Saved. The homepage updates within a minute.</AdmNotice>}
  <p className="adm-banner">{connected?<>Shopify is connected. The homepage uses your Shopify collections <b>Best Sellers</b> (handle <code>best-sellers</code>) and <b>New Arrivals</b> (handle <code>new-arrivals</code>). The picks below are only used if a collection is empty.</>:<>Choose the products for the homepage <b>Best Sellers</b> and <b>New Arrivals</b>. Once Shopify is connected, the Shopify collections “Best Sellers” and “New Arrivals” take over automatically.</>}</p>
  <form action={saveHomePicks} className="adm-cols">
   <section className="adm-card"><h2>Best Sellers</h2><p className="adm-muted">Shown as the product cards with filters. Cut-out photos look best.</p><HomePicker name="best" items={items} initial={picks.best}/></section>
   <section className="adm-card"><h2>New Arrivals</h2><p className="adm-muted">Shown in the carousel.</p><HomePicker name="arrivals" items={items} initial={picks.arrivals}/></section>
   <div className="adm-save"><button className="pill">Save homepage products</button></div>
  </form>
 </AdminShell>;}
