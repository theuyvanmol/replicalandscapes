/* Desktop: once you've scrolled past the top, the menu slides back in as soon as you scroll up,
   and tucks away while you scroll down. It returns to normal at the top of the page. */
(()=>{const h=[...document.querySelectorAll('header')].find(x=>x.querySelector('.brand,.logo-brand')&&!x.closest('[class*="adm"]'));if(!h)return;
 const root=document.documentElement,mq=matchMedia('(min-width:901px)');let last=scrollY,acc=0,tick=false;
 const set=(c,on)=>root.classList.toggle(c,on);
 const update=()=>{tick=false;const y=scrollY,dy=y-last;last=y;
  if(!mq.matches||h.classList.contains('mega-is-open')){if(!mq.matches){set('hdr-float',false);set('hdr-hide',false);}return;}
  const limit=(h.offsetHeight||120)+160;
  if(y<=limit*0.5){set('hdr-float',false);set('hdr-hide',false);acc=0;return;}
  if(y>limit&&!root.classList.contains('hdr-float')){set('hdr-hide',true);requestAnimationFrame(()=>set('hdr-float',true));return;}
  acc=(Math.sign(dy)===Math.sign(acc)?acc:0)+dy;
  if(acc>24)set('hdr-hide',true);else if(acc<-8)set('hdr-hide',false);};
 addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(update);}},{passive:true});
 h.addEventListener('focusin',()=>set('hdr-hide',false));update();})();
