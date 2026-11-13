import {currentCustomer,currentStaff} from '@/lib/auth';
import {getFile,getProject} from '@/lib/portal';
/* Project files are private: only the client the project belongs to, or the team, can open them. */
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const f=await getFile(id);if(!f)return new Response('Not found',{status:404});
 const staff=await currentStaff();if(!staff){const c=await currentCustomer();const p=await getProject(f.project);if(!c||!p||p.email!==c.email)return new Response('Not found',{status:404});}
 const safe=f.name.replace(/[^\w.\- ]+/g,'_').slice(0,100)||'file';const inline=/^(image\/|application\/pdf)/.test(f.type);
 return new Response(Buffer.from(f.b64,'base64'),{headers:{'Content-Type':f.type,'Content-Disposition':`${inline?'inline':'attachment'}; filename="${safe}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
