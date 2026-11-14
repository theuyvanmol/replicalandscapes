import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {newToken} from '@/lib/security';
import {sendEmail,brandEmail,siteUrl,emailReady} from '@/lib/email';
/* Internal steps of sign-in flows. Kept out of the server-actions file so they can't be called from a browser. */
export const TFA_COOKIE='rl_2fa';
export async function beginTwoStep(email:string){const t=await newToken('login2fa',email,300);(await cookies()).set(TFA_COOKIE,t,{httpOnly:true,secure:true,sameSite:'lax',path:'/admin',maxAge:300});redirect('/admin/login/verify');}
export async function sendVerification(email:string){if(!emailReady)return false;const t=await newToken('verify',email,7*86400);
 return sendEmail(email,'Confirm your email for Replica Landscapes',brandEmail({title:'Confirm your email',lead:'Confirm this is your email address and we’ll link your account to any orders you placed with artificialplants.co.uk or replicaplants.co.uk.',button:'Confirm my email',url:siteUrl()+'/account/verify?t='+t,foot:'This link works for 7 days.'}));}
