import 'server-only';
import {randomBytes} from 'node:crypto';
import {kv,kvReady} from '@/lib/kv';
/* Customer portal data: plants a customer owns (with care reminders) and bespoke projects. */
export const pid=()=>randomBytes(6).toString('hex');
const parse=<T,>(s:unknown,f:T):T=>{try{return typeof s==='string'?JSON.parse(s) as T:f;}catch{return f;}};

/* ---------- My plants ---------- */
export type Plant={id:string;handle:string;title:string;image:string;category:string;size:string;room:string;added:string;lastCare:string;interval:number;reminders:boolean;addedBy:'customer'|'team';note:string};
export const CARE_DAYS=(category:string,outdoor=false)=>outdoor?90:/flower|foliage/i.test(category)?60:/hedg|screen|living wall|moss/i.test(category)?120:/plant|grass/i.test(category)?90:120;
export const CARE_TIPS:Record<string,string[]>={
 trees:['Dust the leaves every few weeks with a soft brush or a hairdryer on a cool setting.','Every few months, wipe larger leaves with a slightly damp cloth.','Keep it a little away from radiators and fires, and turn it now and then if it sits by a sunny window.'],
 plants:['Dust regularly with a soft brush or a hairdryer on a cool setting.','Wipe broad leaves with a slightly damp cloth every few months.','Gently reshape stems and leaves by hand if they have been moved.'],
 flowers:['Shake gently or use a hairdryer on a cool setting to lift dust.','Avoid getting delicate petals wet.','Keep out of strong direct sunlight to protect the colours.'],
 outdoor:['Rinse with a garden hose a few times a year to clear dust and pollen.','Brush away leaves and debris after windy weather.','Check that planters are weighted and fixings are secure before winter.'],
 walls:['Dust with a soft, dry brush.','Keep preserved moss dry: never spray or wet it.','Check panel fixings once a year.'],
};
export const tipsFor=(p:Pick<Plant,'category'|'interval'>)=>p.interval<=90&&!/flower|foliage|plant|grass/i.test(p.category)?CARE_TIPS.outdoor:/flower|foliage/i.test(p.category)?CARE_TIPS.flowers:/living wall|moss/i.test(p.category)?CARE_TIPS.walls:/plant|grass/i.test(p.category)?CARE_TIPS.plants:/hedg|screen/i.test(p.category)?CARE_TIPS.outdoor:CARE_TIPS.trees;
export function careStatus(p:Plant,now=Date.now()){const from=Date.parse(p.lastCare||p.added)||now;const next=from+p.interval*864e5;const days=Math.ceil((next-now)/864e5);return {next:new Date(next).toISOString(),days,state:(days<=0?'due':days<=14?'soon':'ok') as 'due'|'soon'|'ok'};}
export async function listPlants(email:string):Promise<Plant[]>{if(!kvReady)return [];return parse<Plant[]>(await kv('GET','plants:'+email),[]);}
async function savePlants(email:string,list:Plant[]){await kv('SET','plants:'+email,JSON.stringify(list.slice(0,200)));if(list.length)await kv('SADD','plants:owners',email);else await kv('SREM','plants:owners',email);}
export async function addPlant(email:string,p:Omit<Plant,'id'>){const list=await listPlants(email);const plant={...p,id:pid()};list.unshift(plant);await savePlants(email,list);return plant;}
export async function updatePlant(email:string,id:string,patch:Partial<Plant>){const list=await listPlants(email);const i=list.findIndex(x=>x.id===id);if(i<0)return;list[i]={...list[i],...patch,id};await savePlants(email,list);}
export async function removePlant(email:string,id:string){await savePlants(email,(await listPlants(email)).filter(x=>x.id!==id));}
export async function allPlantOwners():Promise<{email:string;plants:Plant[]}[]>{if(!kvReady)return [];const owners=(await kv<string[]>('SMEMBERS','plants:owners'))||[];if(!owners.length)return [];const raw=(await kv<(string|null)[]>('MGET',...owners.map(e=>'plants:'+e)))||[];return owners.map((email,i)=>({email,plants:parse<Plant[]>(raw[i],[])}));}

/* ---------- Projects ---------- */
export const STAGES=['Consultation','Design proposal','Build','Installation','Aftercare'] as const;
export type ProjectFile={id:string;name:string;kind:'proposal'|'quote'|'invoice'|'certificate'|'photo'|'document';type:string;size:number;at:string;url?:string;approval?:{status:'pending'|'approved'|'changes';at?:string;note?:string;by?:string}};
export type Project={id:string;ref:string;email:string;title:string;site:string;summary:string;stage:number;created:string;updated:string;
 updates:{id:string;at:string;by:string;text:string}[];files:ProjectFile[];messages:{id:string;at:string;from:'client'|'team';name:string;text:string}[];seenByClient?:string;seenByTeam?:string};
export async function getProject(id:string):Promise<Project|null>{if(!kvReady||!/^[a-f0-9]{12}$/.test(id))return null;return parse<Project|null>(await kv('GET','project:'+id),null);}
export async function saveProject(p:Project){p.updated=new Date().toISOString();await kv('SET','project:'+p.id,JSON.stringify(p));await kv('ZADD','projects',Date.parse(p.updated),p.id);await kv('SADD','projects:'+p.email,p.id);}
export async function deleteProject(p:Project){for(const f of p.files)if(!f.url)await kv('DEL','pfile:'+f.id);await kv('DEL','project:'+p.id);await kv('ZREM','projects',p.id);await kv('SREM','projects:'+p.email,p.id);}
export async function listProjects(email?:string):Promise<Project[]>{if(!kvReady)return [];const ids=email?((await kv<string[]>('SMEMBERS','projects:'+email))||[]):((await kv<string[]>('ZREVRANGE','projects',0,199))||[]);if(!ids.length)return [];
 const raw=(await kv<(string|null)[]>('MGET',...ids.map(i=>'project:'+i)))||[];return raw.map(r=>parse<Project|null>(r,null)).filter((p):p is Project=>!!p&&(!email||p.email===email)).sort((a,b)=>b.updated.localeCompare(a.updated));}
export async function newRef(){const n=Number(await kv('INCR','projects:counter'))||1;return 'RL-'+String(1000+n);}
export async function putFile(id:string,data:{type:string;b64:string;name:string;project:string}){await kv('SET','pfile:'+id,JSON.stringify(data));}
export async function getFile(id:string){if(!kvReady||!/^[a-f0-9]{12}$/.test(id))return null;return parse<{type:string;b64:string;name:string;project:string}|null>(await kv('GET','pfile:'+id),null);}
export const pendingApprovals=(p:Project)=>p.files.filter(f=>f.approval?.status==='pending').length;
export const unreadForClient=(p:Project)=>[...p.messages.filter(m=>m.from==='team'),...p.updates].filter(x=>!p.seenByClient||x.at>p.seenByClient).length;
export const unreadForTeam=(p:Project)=>p.messages.filter(m=>m.from==='client'&&(!p.seenByTeam||m.at>p.seenByTeam)).length+p.files.filter(f=>f.approval&&f.approval.status!=='pending'&&f.approval.at&&(!p.seenByTeam||f.approval.at>p.seenByTeam)).length;
export const fileUrl=(f:ProjectFile)=>f.url||'/api/files/'+f.id;
export const KIND_LABEL:Record<ProjectFile['kind'],string>={proposal:'Design proposal',quote:'Quote',invoice:'Invoice',certificate:'Certificate',photo:'Photo',document:'Document'};
export async function markSeen(p:Project,who:'client'|'team'){const k=who==='client'?'seenByClient':'seenByTeam';p[k]=new Date().toISOString();await kv('SET','project:'+p.id,JSON.stringify(p));}
