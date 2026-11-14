'use client';
import {useEffect,useRef} from 'react';
import {LAND} from '@/lib/land';
/* A slowly turning dotted globe: green pulses are people on the site now, gold dots are where orders were sent.
   Drag to spin it. Drawn on a canvas with no external libraries. */
export type Pt={lat:number;lon:number;city:string;cc:string;n:number;t?:number};
const DOTS:[number,number][]=(()=>{const out:[number,number][]=[];LAND.split('|').forEach((row,y)=>{const lat=90-(y*2+1);row.split(' ').filter(Boolean).forEach(run=>{const [s,l]=run.split('.').map(Number);for(let x=s;x<s+l;x++)out.push([lat,-180+x*2+1]);});});return out;})();
const R=Math.PI/180;
export default function Globe({live,orders,focus}:{live:Pt[];orders:Pt[];focus?:[number,number]}){
 const cv=useRef<HTMLCanvasElement>(null);const st=useRef({rot:-(focus?.[1]??-2),tilt:-(focus?.[0]??30)*0.6,drag:null as null|{x:number;y:number;rot:number;tilt:number},live,orders,hover:null as null|Pt});
 st.current.live=live;st.current.orders=orders;
 useEffect(()=>{const c=cv.current!;const g=c.getContext('2d')!;let raf=0,last=performance.now();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size=()=>{const r=c.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);c.width=r.width*d;c.height=r.height*d;g.setTransform(d,0,0,d,0,0);};size();const ro=new ResizeObserver(size);ro.observe(c);
  const proj=(lat:number,lon:number,w:number,h:number,rad:number)=>{const s=st.current;const l=(lon+s.rot)*R,p=lat*R,t=s.tilt*R;
   let x=Math.cos(p)*Math.sin(l),y=Math.sin(p),z=Math.cos(p)*Math.cos(l);const y2=y*Math.cos(t)-z*Math.sin(t),z2=y*Math.sin(t)+z*Math.cos(t);return {x:w/2+x*rad,y:h/2-y2*rad,z:z2};};
  const draw=(now:number)=>{const s=st.current;const dt=Math.min(50,now-last);last=now;if(!s.drag&&!reduce)s.rot+=dt*0.004;
   const w=c.clientWidth,h=c.clientHeight,rad=Math.min(w,h)/2-10;g.clearRect(0,0,w,h);
   const grd=g.createRadialGradient(w/2-rad*.3,h/2-rad*.35,rad*.1,w/2,h/2,rad);grd.addColorStop(0,'#2c4537');grd.addColorStop(1,'#16241c');g.fillStyle=grd;g.beginPath();g.arc(w/2,h/2,rad,0,7);g.fill();
   g.fillStyle='rgba(214,226,207,.55)';for(const [la,lo] of DOTS){const q=proj(la,lo,w,h,rad);if(q.z>0){const r=.6+q.z*.9;g.globalAlpha=.25+q.z*.75;g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill();}}g.globalAlpha=1;
   const pulse=(now%1800)/1800;
   for(const o of s.orders){const q=proj(o.lat,o.lon,w,h,rad);if(q.z<=0)continue;const r=2.5+Math.min(6,Math.sqrt(o.n)*1.6);g.fillStyle='rgba(222,178,92,.9)';g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill();}
   for(const p of s.live){const q=proj(p.lat,p.lon,w,h,rad);if(q.z<=0)continue;const r=3+Math.min(5,p.n);g.strokeStyle=`rgba(94,214,140,${1-pulse})`;g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,r+pulse*16,0,7);g.stroke();g.fillStyle='#5ed68c';g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill();}
   const hv=s.hover;if(hv){const q=proj(hv.lat,hv.lon,w,h,rad);if(q.z>0){const label=(hv.city?hv.city+', ':'')+hv.cc+' · '+hv.n+(hv.t!==undefined?(hv.n===1?' order':' orders'):' live');g.font='12px system-ui,sans-serif';const tw=g.measureText(label).width;g.fillStyle='rgba(250,248,243,.95)';g.beginPath();g.roundRect(q.x+10,q.y-26,tw+16,22,6);g.fill();g.fillStyle='#22382c';g.fillText(label,q.x+18,q.y-11);}}
   raf=requestAnimationFrame(draw);};raf=requestAnimationFrame(draw);
  const pos=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const down=(e:PointerEvent)=>{const s=st.current;s.drag={...pos(e),rot:s.rot,tilt:s.tilt};c.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{const s=st.current;const p=pos(e);if(s.drag){s.rot=s.drag.rot+(p.x-s.drag.x)*0.4;s.tilt=Math.max(-60,Math.min(60,s.drag.tilt+(p.y-s.drag.y)*0.3));return;}
   const w=c.clientWidth,h=c.clientHeight,rad=Math.min(w,h)/2-10;let best:Pt|null=null,bd=14;for(const pt of [...s.live,...s.orders]){const q=proj(pt.lat,pt.lon,w,h,rad);if(q.z<=0)continue;const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=pt;}}s.hover=best;};
  const up=()=>{st.current.drag=null;};
  c.addEventListener('pointerdown',down);c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointerleave',()=>{st.current.hover=null;});
  return ()=>{cancelAnimationFrame(raf);ro.disconnect();c.removeEventListener('pointerdown',down);c.removeEventListener('pointermove',move);c.removeEventListener('pointerup',up);};},[]);
 return <div className="globe"><canvas ref={cv} role="img" aria-label={`Globe showing ${live.reduce((t,p)=>t+p.n,0)} people on the site now and ${orders.length} order locations`}/>
  <div className="globe-key"><span><i className="k-live"/>On the site now</span><span><i className="k-order"/>Orders sent to</span></div></div>;
}
