'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireStaff,audit,normEmail,validEmail} from '@/lib/auth';
import {getProject,saveProject,deleteProject,newRef,pid,addPlant,updatePlant,removePlant,CARE_DAYS,STAGES,type Project,type ProjectFile} from '@/lib/portal';
import {findProduct} from '@/lib/plant-catalogue';
const str=(fd:FormData,k:string,max=200)=>String(fd.get(k)||'').replace(/\r/g,'').trim().slice(0,max);
const KINDS=['proposal','quote','invoice','certificate','photo','document'];

export async function createProject(fd:FormData){const u=await requireStaff();const email=normEmail(str(fd,'email',190));const title=str(fd,'title',120);
 if(!validEmail(email)||!title)redirect('/admin/projects?e=new');
 const now=new Date().toISOString();const p:Project={id:pid(),ref:await newRef(),email,title,site:str(fd,'site',120),summary:str(fd,'summary',2000),stage:0,created:now,updated:now,updates:[{id:pid(),at:now,by:u.name,text:'Project created. Welcome to your project page: this is where you’ll see progress, documents and messages from our team.'}],files:[],messages:[]};
 await saveProject(p);await audit(u.email,'project.create',p.ref);redirect('/admin/projects/'+p.id+'?saved=created');}
async function load(fd:FormData){const u=await requireStaff();const p=await getProject(str(fd,'project',20));if(!p)redirect('/admin/projects');return {u,p};}
export async function editProject(fd:FormData){const {u,p}=await load(fd);const stage=Number(str(fd,'stage',2));const prev=p.stage;
 p.title=str(fd,'title',120)||p.title;p.site=str(fd,'site',120);p.summary=str(fd,'summary',2000);
 const email=normEmail(str(fd,'email',190));if(validEmail(email)&&email!==p.email){const {kv}=await import('@/lib/kv');await kv('SREM','projects:'+p.email,p.id);p.email=email;}
 if(stage>=0&&stage<STAGES.length&&stage!==prev){p.stage=stage;p.updates.unshift({id:pid(),at:new Date().toISOString(),by:u.name,text:`Your project has moved to ${STAGES[stage]}.`});}
 await saveProject(p);redirect(`/admin/projects/${p.id}?saved=details`);}
export async function postUpdate(fd:FormData){const {u,p}=await load(fd);const text=str(fd,'text',3000);if(text){p.updates.unshift({id:pid(),at:new Date().toISOString(),by:u.name,text});p.updates=p.updates.slice(0,200);await saveProject(p);}redirect(`/admin/projects/${p.id}?saved=update#updates`);}
export async function teamMessage(fd:FormData){const {u,p}=await load(fd);const text=str(fd,'text',3000);if(text){p.messages.push({id:pid(),at:new Date().toISOString(),from:'team',name:u.name,text});p.messages=p.messages.slice(-300);await saveProject(p);}redirect(`/admin/projects/${p.id}#messages`);}
export async function addLink(fd:FormData){const {p}=await load(fd);const url=str(fd,'url',500);const kind=str(fd,'kind',20);
 if(/^https:\/\//.test(url)){const f:ProjectFile={id:pid(),name:str(fd,'name',120)||'Shared file',kind:(KINDS.includes(kind)?kind:'document') as ProjectFile['kind'],type:'link',size:0,at:new Date().toISOString(),url};if(fd.get('approval')==='on')f.approval={status:'pending'};p.files.unshift(f);await saveProject(p);}
 redirect(`/admin/projects/${p.id}?saved=file#files`);}
export async function removeFile(fd:FormData){const {p}=await load(fd);const id=str(fd,'file',20);const f=p.files.find(x=>x.id===id);if(f&&!f.url){const {kv}=await import('@/lib/kv');await kv('DEL','pfile:'+id);}p.files=p.files.filter(x=>x.id!==id);await saveProject(p);redirect(`/admin/projects/${p.id}#files`);}
export async function askApproval(fd:FormData){const {p}=await load(fd);const f=p.files.find(x=>x.id===str(fd,'file',20));if(f){f.approval={status:'pending'};await saveProject(p);}redirect(`/admin/projects/${p.id}#files`);}
export async function removeProject(fd:FormData){const u=await requireStaff(['owner','admin']);const p=await getProject(str(fd,'project',20));if(p&&fd.get('confirm')==='yes'){await deleteProject(p);await audit(u.email,'project.delete',p.ref);redirect('/admin/projects?saved=deleted');}redirect(`/admin/projects/${str(fd,'project',20)}?e=confirm`);}

export async function teamAddPlant(fd:FormData){const u=await requireStaff();const email=normEmail(str(fd,'email',190));const prod=await findProduct(str(fd,'handle',120));
 if(!validEmail(email)||!prod)redirect('/admin/care?e=add#add');
 const m=str(fd,'installed',7);const added=/^\d{4}-\d{2}$/.test(m)?new Date(m+'-15T12:00:00Z').toISOString():new Date().toISOString();
 await addPlant(email,{handle:prod.handle,title:prod.title,image:prod.image,category:prod.category,size:str(fd,'size',80),room:str(fd,'room',60),added,lastCare:added,interval:CARE_DAYS(prod.category,prod.outdoor),reminders:true,addedBy:'team',note:str(fd,'note',300)});
 await audit(u.email,'plant.add',email);revalidatePath('/admin/care');redirect('/admin/care?saved=added&email='+encodeURIComponent(email));}
export async function teamCareDone(fd:FormData){await requireStaff();const email=normEmail(str(fd,'email',190));await updatePlant(email,str(fd,'id',20),{lastCare:new Date().toISOString()});redirect('/admin/care?saved=care');}
export async function teamRemovePlant(fd:FormData){await requireStaff(['owner','admin']);const email=normEmail(str(fd,'email',190));await removePlant(email,str(fd,'id',20));redirect('/admin/care?saved=removed');}
