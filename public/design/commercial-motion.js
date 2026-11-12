(()=>{
 const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),page=document.querySelector('.commercial-page');
 const targets=[...document.querySelectorAll('.commercial-intro>div,.commercial-sector figure,.commercial-sector-copy,.oak-heading,.oak-image,.oak-details>div,.process-heading,.process-grid article,.commercial-faq>div,.commercial-enquiry,.home-commercial-art,.home-commercial-copy')];
 let observer;
 if('IntersectionObserver' in window){
  targets.forEach((el,i)=>{el.classList.add('motion-reveal');el.style.setProperty('--motion-delay',(el.matches('.process-grid article')?(i%4)*100:0)+'ms');});
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('in-view');observer.unobserve(entry.target);entry.target.querySelectorAll('[data-count]').forEach(countUp);}),{threshold:.12,rootMargin:'0px 0px -25px 0px'});targets.forEach(el=>observer.observe(el));root.classList.add('immersive-ready');
 }
 function countUp(el){if(el.dataset.counted)return;el.dataset.counted='true';const value=+el.dataset.count;if(reduced.matches)return;const start=performance.now();function frame(now){const p=Math.min(1,(now-start)/1300),ease=1-Math.pow(1-p,3);el.textContent=String(Math.round(ease*value));if(p<1)requestAnimationFrame(frame);}requestAnimationFrame(frame);}
 const hero=document.querySelector('.commercial-hero'),heroImage=hero?.querySelector(':scope>img'),heroCopy=hero?.querySelector('.commercial-hero-copy'),oak=document.querySelector('.oak-image'),oakImage=oak?.querySelector('img'),progress=document.querySelector('.commercial-progress');
 const jumpLinks=[...document.querySelectorAll('.commercial-jump a')],sections=jumpLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
 let queued=false,pointerX=0,pointerY=0;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 if(hero&&fine.matches)hero.addEventListener('pointermove',e=>{const rect=hero.getBoundingClientRect();pointerX=(e.clientX-rect.left)/rect.width-.5;pointerY=(e.clientY-rect.top)/rect.height-.5;schedule();});
 hero?.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;schedule();});
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(update);}
 function update(){queued=false;const distance=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.transform=`scaleX(${Math.max(0,Math.min(1,scrollY/Math.max(1,distance)))})`;
  if(heroImage){const rect=hero.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const y=reduced.matches?0:Math.max(-50,Math.min(60,-rect.top*.13));heroImage.style.transform=reduced.matches?'none':`translate3d(${pointerX*8}px,${y+pointerY*5}px,0) scale(1.035)`;if(heroCopy&&!reduced.matches){const p=Math.min(1,Math.max(0,-rect.top/hero.offsetHeight));heroCopy.style.opacity=String(Math.max(.15,1-p*1.2));heroCopy.style.transform=`translateY(${p*45}px)`;}}}
  if(oakImage){const rect=oak.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const p=(innerHeight/2-(rect.top+rect.height/2))/innerHeight;oakImage.style.transform=reduced.matches?'none':`translate3d(0,${Math.max(-35,Math.min(25,p*60))}px,0) scale(1.02)`;}}
  let selected=-1;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.48)selected=i;});jumpLinks.forEach((a,i)=>{if(i===selected)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 }
 if(page){window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',()=>{heroCopy?.style.removeProperty('opacity');heroCopy?.style.removeProperty('transform');schedule();});schedule();}
 const dialog=document.querySelector('#projectLightbox');let previousFocus;
 if(dialog){const img=dialog.querySelector('img'),caption=dialog.querySelector('.project-lightbox-caption p');document.querySelectorAll('button[data-zoom]').forEach(button=>button.addEventListener('click',()=>{previousFocus=button;img.src=button.dataset.zoom;img.alt=button.closest('figure')?.querySelector('img')?.alt||'Installation photograph';caption.textContent=button.dataset.caption;dialog.showModal();if(!reduced.matches)dialog.animate([{opacity:0,transform:'translateY(35px) scale(.95)'},{opacity:1,transform:'none'}],{duration:550,easing:'cubic-bezier(.16,.7,.2,1)'});}));dialog.querySelector('.project-lightbox-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));}
})();
