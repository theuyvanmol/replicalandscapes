import {NextResponse} from 'next/server';import {currentStaff,audit} from '@/lib/auth';import {saveMedia} from '@/lib/content';
// Images are resized in the browser before upload, so they stay small enough for the database.
export async function POST(req:Request){
 const u=await currentStaff();if(!u)return NextResponse.json({error:'Please sign in again.'},{status:401});
 let b:{type?:string;data?:string;name?:string};try{b=await req.json();}catch{return NextResponse.json({error:'Bad upload.'},{status:400});}
 if(!b.type||!/^image\/(webp|jpeg|png)$/.test(b.type)||!b.data)return NextResponse.json({error:'Please upload a JPG, PNG or WebP image.'},{status:400});
 if(b.data.length>900_000)return NextResponse.json({error:'That image is too large even after compressing. Try a smaller photo.'},{status:413});
 const url=await saveMedia(b.type,b.data,String(b.name||'image').slice(0,80));
 await audit(u.email,'Uploaded an image',String(b.name||''));
 return NextResponse.json({url});
}
