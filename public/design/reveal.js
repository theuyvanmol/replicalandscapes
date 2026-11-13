// Scroll reveals and gentle parallax for the gallery, installation, blog and gift card pages.
(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const root=document.documentElement;root.classList.add('rv-ready');
 const sel='.in-steps>.eyebrow,.in-steps h2,.in-steps li,.in-apps>.eyebrow,.in-apps h2,.in-apps article,.in-why h2,.in-why li,.in-proj-head,.in-faq h2,.in-faq details,.in-quote>.eyebrow,.in-quote h2,.in-quote p,.in-quote .in-actions,.blog-lead,.blog-card,.blog-empty,.post-head>*,.post-cover,.post-body,.post-foot,.post-more h2,.gl-cta>*,.gl-filters,.gc-form fieldset,.gc-total,.gc-buy,.gc-faq h2,.gc-faq details';
 const els=[...document.querySelectorAll(sel)];
 els.forEach(el=>{el.classList.add('rv');const sib=[...el.parentElement.children].filter(c=>c.matches(sel));el.style.setProperty('--rvd',(Math.min(sib.indexOf(el),6)*90)+'ms');});
 document.querySelectorAll('.in-line,.in-app-img,.blog-lead-img,.blog-card-img,.post-cover').forEach(el=>el.classList.add('rv-wipe'));
 const all=document.querySelectorAll('.rv,.rv-wipe');
 if(reduce||!('IntersectionObserver' in window)){all.forEach(e=>e.classList.add('rv-in'));return;}
 // a fully clipped element is never reported as visible, so wipes are watched through their parent
 const proxy=new Map();
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){(proxy.get(e.target)||[e.target]).forEach(t=>t.classList.add('rv-in'));io.unobserve(e.target);}}),{rootMargin:'0px 0px -10% 0px',threshold:.05});
 all.forEach(e=>{if(e.classList.contains('rv-wipe')&&e.parentElement){const p=e.parentElement;proxy.set(p,[...(proxy.get(p)||[]),e]);io.observe(p);}else io.observe(e);});
 requestAnimationFrame(()=>document.querySelectorAll('.in-hero,.gl-hero').forEach(h=>h.classList.add('is-on')));
 const px=[...document.querySelectorAll('[data-parallax]')];if(!px.length)return;let tick=false;
 const run=()=>{tick=false;const vh=innerHeight;px.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const f=parseFloat(el.dataset.parallax)||.15;el.style.transform=`translate3d(0,${((r.top+r.height/2)-vh/2)*-f}px,0)`;});};
 addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(run);}},{passive:true});run();
})();
