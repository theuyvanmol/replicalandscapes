import 'server-only';
import {admin,adminReady,userErrors,AdminError} from '@/lib/shopify-admin';
import {siteUrl} from '@/lib/email';
/* Registers the Shopify "order placed" webhook that drives the team's new-order emails. */
export const hookUrl=()=>siteUrl()+'/api/webhooks/shopify';
async function list():Promise<{id:string;uri:string}[]>{
 try{const d=await admin<any>(`{webhookSubscriptions(first:50,topics:[ORDERS_CREATE]){nodes{id uri}}}`);return d.webhookSubscriptions.nodes;}
 catch{const d=await admin<any>(`{webhookSubscriptions(first:50,topics:[ORDERS_CREATE]){nodes{id endpoint{... on WebhookHttpEndpoint{callbackUrl}}}}}`);return d.webhookSubscriptions.nodes.map((n:any)=>({id:n.id,uri:n.endpoint?.callbackUrl||''}));}}
export async function orderAlertsOn(){if(!adminReady)return false;try{return (await list()).some(n=>n.uri===hookUrl());}catch{return false;}}
export async function enableOrderAlerts(){
 if(!adminReady)throw new AdminError('Shopify admin is not connected yet.');
 if((await list()).some(n=>n.uri===hookUrl()))return;
 try{const d=await admin<any>(`mutation($u:URL!){webhookSubscriptionCreate(topic:ORDERS_CREATE,webhookSubscription:{uri:$u,format:JSON}){webhookSubscription{id} userErrors{message}}}`,{u:hookUrl()});userErrors(d.webhookSubscriptionCreate);}
 catch(e){if(e instanceof AdminError&&!/uri|argument|field/i.test(e.message))throw e;
  const d=await admin<any>(`mutation($u:URL!){webhookSubscriptionCreate(topic:ORDERS_CREATE,webhookSubscription:{callbackUrl:$u,format:JSON}){webhookSubscription{id} userErrors{message}}}`,{u:hookUrl()});userErrors(d.webhookSubscriptionCreate);}}
