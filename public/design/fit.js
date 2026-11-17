/* Product photos: studio shots (white or transparent background) are shown whole, never cropped;
   room photos fill the frame. Each image is checked once in the browser by sampling its edges. */
(()=>{const seen=new WeakSet();
 const mark=(img,studio)=>{const box=img.closest('[data-fit]');if(box){box.classList.remove('fit-studio','fit-photo');box.classList.add(studio?'fit-studio':'fit-photo');}};
 const check=img=>{if(seen.has(img))return;seen.add(img);
  const run=()=>{try{const N=24,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,N,N);const d=g.getImageData(0,0,N,N).data;
   let light=0,n=0;for(let k=0;k<N;k++)for(const [x,y] of [[k,0],[k,N-1],[0,k],[N-1,k]]){const i=(y*N+x)*4,r=d[i],gr=d[i+1],b=d[i+2],a=d[i+3];n++;if(a<40||(r>222&&gr>222&&b>222&&Math.max(r,gr,b)-Math.min(r,gr,b)<20))light++;}
   mark(img,light/n>0.72);}catch(e){mark(img,true);}};
  if(img.complete&&img.naturalWidth)run();else img.addEventListener('load',run,{once:true});};
 const scan=root=>{if(root.matches&&root.matches('[data-fit] img'))check(root);root.querySelectorAll&&root.querySelectorAll('[data-fit] img').forEach(check);};
 scan(document);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.documentElement,{childList:true,subtree:true});})();
