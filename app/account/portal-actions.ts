'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireCustomer} from '@/lib/auth';
import {addPlant,updatePlant,removePlant,listPlants,CARE_DAYS,getProject,saveProject,pid} from '@/lib/portal';
import {findProduct} from '@/lib/plant-catalogue';
const str=(fd:FormData,k:string,max=200)=>String(fd.get(k)||'').replace(/\r/g,'').trim().slice(0,max);
const monthToISO=(m:string)=>/^\d{4}-\d{2}$/.test(m)?new Date(m+'-15T12:00:00Z').toISOString():new Date().toISOString();

export async function addMyPlant(fd:FormData){const u=await requireCustomer();
 const prod=await findProduct(str(fd,'handle',120));if(!prod)redirect('/account/plants?e=pick#add');
 if((await listPlants(u.email)).length>=200)redirect('/account/plants?e=full');
 const added=monthToISO(str(fd,'bought',7));
 await addPlant(u.email,{handle:prod.handle,title:prod.title,image:prod.image,category:prod.category,size:str(fd,'size',80),room:str(fd,'room',60),added,lastCare:added,interval:CARE_DAYS(prod.category,prod.outdoor),reminders:fd.get('reminders')==='on',addedBy:'customer',note:''});
 revalidatePath('/account');redirect('/account/plants?saved=added');}
export async function careDone(fd:FormData){const u=await requireCustomer();await updatePlant(u.email,str(fd,'id',20),{lastCare:new Date().toISOString()});revalidatePath('/account');redirect('/account/plants?saved=care');}
export async function editMyPlant(fd:FormData){const u=await requireCustomer();const iv=Number(str(fd,'interval',4));
 await updatePlant(u.email,str(fd,'id',20),{room:str(fd,'room',60),size:str(fd,'size',80),reminders:fd.get('reminders')==='on',...([30,60,90,120,180,365].includes(iv)?{interval:iv}:{})});revalidatePath('/account');redirect('/account/plants?saved=edit');}
export async function removeMyPlant(fd:FormData){const u=await requireCustomer();await removePlant(u.email,str(fd,'id',20));revalidatePath('/account');redirect('/account/plants?saved=removed');}

async function myProject(id:string){const u=await requireCustomer();const p=await getProject(id);if(!p||p.email!==u.email)redirect('/account');return {u,p};}
export async function respondToFile(fd:FormData){const id=str(fd,'project',20);const {u,p}=await myProject(id);const f=p.files.find(x=>x.id===str(fd,'file',20));
 const decision=str(fd,'decision',10);if(f?.approval&&['approved','changes'].includes(decision)){f.approval={status:decision as 'approved'|'changes',at:new Date().toISOString(),note:str(fd,'note',1000),by:u.name};
  p.messages.push({id:pid(),at:new Date().toISOString(),from:'client',name:u.name,text:(decision==='approved'?`Approved “${f.name}”.`:`Requested changes to “${f.name}”.`)+(f.approval.note?' '+f.approval.note:'')});await saveProject(p);}
 redirect(`/account/projects/${id}?saved=${decision}#approvals`);}
export async function clientMessage(fd:FormData){const id=str(fd,'project',20);const {u,p}=await myProject(id);const text=str(fd,'text',3000);
 if(text){p.messages.push({id:pid(),at:new Date().toISOString(),from:'client',name:u.name,text});p.messages=p.messages.slice(-300);await saveProject(p);}
 redirect(`/account/projects/${id}#messages`);}
