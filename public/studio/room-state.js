export const PLANTS=[
 {id:'broadleaf',name:'Broadleaf tree',detail:'Full, sculptural foliage',height:1.55,image:'broadleaf-thumb.png'},
 {id:'arrow',name:'Variegated foliage',detail:'Soft, heart-shaped leaves',height:.94,image:'arrow-thumb.png'},
 {id:'calathea',name:'Calathea orbifolia',detail:'Bold, striped leaves',height:.83,image:'calathea-thumb.png'},
 {id:'pachira',name:'Pachira aquatica',detail:'Airy, architectural canopy',height:1.65,image:'pachira-thumb.png'}
];
export const FINISHES={chalk:{name:'Chalk',color:'#c8c1af',roughness:.5},sand:{name:'Sand',color:'#a58a66',roughness:.85},charcoal:{name:'Charcoal',color:'#353d35',roughness:.8},clay:{name:'Terracotta',color:'#b16d49',roughness:.9}};
export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function dimensions(item){const h=clamp(Number(item.height)||1,.4,2.6),potHeight=h*.29*clamp(Number(item.potScale)||1,.7,1.4);return {height:h,potHeight,foliageHeight:h-potHeight*.93,radius:potHeight*.58};}
export function sanitize(items){if(!Array.isArray(items))return [];return items.slice(0,12).filter(i=>PLANTS.some(p=>p.id===i.type)).map((i,index)=>({id:'plant-'+index,type:i.type,x:clamp(Number(i.x)||0,-3.25,3.25),z:clamp(Number(i.z)||0,-3.1,3.1),height:clamp(Number(i.height)||1,.4,2.6),rotation:clamp(Number(i.rotation)||0,-180,180),pot:['round','tapered','ribbed','pedestal'].includes(i.pot)?i.pot:'tapered',finish:Object.hasOwn(FINISHES,i.finish)?i.finish:'chalk',potScale:clamp(Number(i.potScale)||1,.7,1.4)}));}
export function defaults(){return sanitize([{type:'broadleaf',x:1.65,z:-1.75,height:1.55,finish:'chalk'},{type:'arrow',x:-2.9,z:.35,height:.94,finish:'charcoal'},{type:'calathea',x:.8,z:.7,height:.83,finish:'chalk'}]);}
