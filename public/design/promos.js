// Homepage promotions band: countdowns, slide rotation, copy-code buttons.
(()=>{const band=document.querySelector('.promo-band');if(!band)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const slides=[...band.querySelectorAll('.pb-slide')],pips=[...band.querySelectorAll('.pb-pip')];let cur=0,timer=null,paused=false;
 const pad=n=>String(Math.max(0,n)).padStart(2,'0');
 function tick(){band.querySelectorAll('.pb-count').forEach(c=>{const ms=new Date(c.dataset.to)-Date.now();if(ms<=0){c.classList.add('is-done');return;}const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,s=Math.floor(ms/1e3)%60;const set=(u,v)=>{const b=c.querySelector('[data-u="'+u+'"]');if(b&&b.textContent!==v){b.textContent=v;b.classList.remove('flip');void b.offsetWidth;b.classList.add('flip');}};set('d',pad(d));set('h',pad(h));set('m',pad(m));set('s',pad(s));});}
 tick();setInterval(tick,1000);
 function show(i){cur=(i+slides.length)%slides.length;slides.forEach((s,k)=>{s.classList.toggle('is-active',k===cur);s.setAttribute('aria-hidden',k===cur?'false':'true');});pips.forEach((p,k)=>p.classList.toggle('is-active',k===cur));tint();restart();}
 const tint=()=>{if(slides[cur])band.style.setProperty('--pip',getComputedStyle(slides[cur]).color);};tint();
 function restart(){clearTimeout(timer);if(slides.length<2||reduce||paused)return;const pip=pips[cur];if(pip){pip.classList.remove('run');void pip.offsetWidth;pip.classList.add('run');}timer=setTimeout(()=>show(cur+1),8000);}
 pips.forEach(p=>p.addEventListener('click',()=>show(Number(p.dataset.go))));
 band.addEventListener('mouseenter',()=>{paused=true;clearTimeout(timer);band.classList.add('is-paused');});
 band.addEventListener('mouseleave',()=>{paused=false;band.classList.remove('is-paused');restart();});
 band.addEventListener('focusin',()=>{paused=true;clearTimeout(timer);band.classList.add('is-paused');});
 band.querySelectorAll('.pb-code').forEach(b=>b.addEventListener('click',async()=>{const span=b.querySelector('span');try{await navigator.clipboard.writeText(b.dataset.code);span.textContent='Copied';}catch(e){span.textContent=b.dataset.code;}setTimeout(()=>span.textContent='Copy',2200);}));
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){band.classList.add('in-view');restart();io.disconnect();}}),{threshold:.25});io.observe(band);
})();
