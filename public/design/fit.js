/* Product photos are NEVER cropped: every product image is shown whole (object-fit: contain).
   Each image is checked once in the browser by sampling its edges:
   - studio shots (plain light background) get the soft studio treatment;
   - room photos get their own edge colours painted into any spare space, so the
     photo appears to fill the frame while nothing of it is cut off. */
(()=>{const seen=new WeakSet();
 const rgb=(d,i)=>'rgb('+d[i]+','+d[i+1]+','+d[i+2]+')';
 const run=img=>{const box=img.closest('[data-fit]');if(!box)return;let studio=true,bg='';
  try{const N=16,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,N,N);const d=g.getImageData(0,0,N,N).data;
   let light=0,n=0;for(let k=0;k<N;k++)for(const [x,y] of [[k,0],[k,N-1],[0,k],[N-1,k]]){const i=(y*N+x)*4,r=d[i],gr=d[i+1],b=d[i+2],a=d[i+3];n++;if(a<40||(Math.min(r,gr,b)>196&&Math.max(r,gr,b)-Math.min(r,gr,b)<26))light++;}
   studio=light/n>0.6;
   if(!studio){const col=x=>{const s=[];for(let y=0;y<N;y++)s.push(rgb(d,(y*N+x)*4)+' '+(y/(N-1)*100).toFixed(1)+'%');return s.join(',')};
    const row=y=>{const s=[];for(let x=0;x<N;x++)s.push(rgb(d,(y*N+x)*4)+' '+(x/(N-1)*100).toFixed(1)+'%');return s.join(',')};
    const ia=img.naturalWidth/img.naturalHeight,ba=(img.clientWidth||1)/(img.clientHeight||1);
    bg=ia<ba?`linear-gradient(to bottom,${col(0)}) left/50.5% 100% no-repeat,linear-gradient(to bottom,${col(N-1)}) right/50.5% 100% no-repeat`
            :`linear-gradient(to right,${row(0)}) top/100% 50.5% no-repeat,linear-gradient(to right,${row(N-1)}) bottom/100% 50.5% no-repeat`;}
  }catch(e){}
  box.classList.remove('fit-studio','fit-photo');box.classList.add(studio?'fit-studio':'fit-photo');img.style.background=bg;};
 const check=img=>{if(seen.has(img))return;seen.add(img);if(img.complete&&img.naturalWidth)run(img);else img.addEventListener('load',()=>run(img),{once:true});};
 const scan=root=>{if(root.matches&&root.matches('[data-fit] img'))check(root);root.querySelectorAll&&root.querySelectorAll('[data-fit] img').forEach(check);};
 scan(document);new MutationObserver(ms=>ms.forEach(m=>{m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);});if(m.type==='attributes'&&m.target.tagName==='IMG'){seen.delete(m.target);check(m.target);}})).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});})();
