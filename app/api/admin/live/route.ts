import {currentStaff} from '@/lib/auth';import {liveNow,stats} from '@/lib/analytics';
export async function GET(){const u=await currentStaff();if(!u)return new Response('Not allowed',{status:403});
 const [live,today]=await Promise.all([liveNow(),stats(1)]);
 return Response.json({live,today:{visitors:today.visitors,pv:today.pv,atc:today.atc,checkout:today.checkout}},{headers:{'Cache-Control':'no-store'}});}
