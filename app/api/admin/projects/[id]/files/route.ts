import {currentStaff} from '@/lib/auth';
import {getProject,saveProject,putFile,pid,type ProjectFile} from '@/lib/portal';
const KINDS=['proposal','quote','invoice','certificate','photo','document'];
const TYPES=/^(application\/pdf|image\/(jpeg|png|webp)|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))$/;
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const u=await currentStaff();if(!u)return Response.json({error:'Please sign in again.'},{status:401});
 const {id}=await params;const p=await getProject(id);if(!p)return Response.json({error:'Project not found.'},{status:404});
 const fd=await req.formData();const file=fd.get('file');if(!(file instanceof File))return Response.json({error:'Choose a file.'},{status:400});
 if(!TYPES.test(file.type))return Response.json({error:'Use a PDF, JPG, PNG, WebP, Word, Excel or PowerPoint file.'},{status:400});
 if(file.size>700*1024)return Response.json({error:'Files must be under 700KB here. For larger files, add a link instead (e.g. Google Drive or Dropbox).'},{status:400});
 const kind=String(fd.get('kind')||'document');const fid=pid();
 await putFile(fid,{type:file.type,b64:Buffer.from(await file.arrayBuffer()).toString('base64'),name:String(fd.get('name')||file.name).slice(0,120),project:p.id});
 const f:ProjectFile={id:fid,name:String(fd.get('name')||file.name).slice(0,120),kind:(KINDS.includes(kind)?kind:'document') as ProjectFile['kind'],type:file.type,size:file.size,at:new Date().toISOString()};
 if(fd.get('approval')==='on')f.approval={status:'pending'};
 p.files.unshift(f);await saveProject(p);return Response.json({ok:true});}
