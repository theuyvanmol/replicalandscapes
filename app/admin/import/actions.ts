'use server';
import {redirect} from 'next/navigation';import {requireStaff,audit} from '@/lib/auth';import {newImportKey,revokeImportKey} from '@/lib/legacy';
export async function createKeyAction(){const u=await requireStaff(['owner','admin']);await newImportKey();await audit(u.email,'Created import key');redirect('/admin/import?key=1');}
export async function revokeKeyAction(){const u=await requireStaff(['owner','admin']);await revokeImportKey();await audit(u.email,'Revoked import key');redirect('/admin/import');}
