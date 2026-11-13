'use server';
import {revalidatePath} from 'next/cache';
import {requireStaff,audit} from '@/lib/auth';
import {markEnquiry,deleteEnquiry} from '@/lib/enquiries';
export async function toggleRead(fd:FormData){const u=await requireStaff();const id=String(fd.get('id')||'');await markEnquiry(id,fd.get('read')==='1');revalidatePath('/admin/enquiries');void u;}
export async function removeEnquiry(fd:FormData){const u=await requireStaff(['owner','admin']);const id=String(fd.get('id')||'');await deleteEnquiry(id);await audit(u.email,'enquiry.delete',id);revalidatePath('/admin/enquiries');}
