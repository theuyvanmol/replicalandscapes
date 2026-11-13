// Gentle scroll reveals for the editorial pages, matching the pace of the rest of the site.
(()=>{const root=document.documentElement;
 const sel='.ed-figures li,.ed-steps li,.ed-sector,.ed-trio-card,.ed-card,.ed-feature,.ed-why>figure,.ed-why>h2,.ed-why>div,.ed-faq .faq-list details,.ed-final,.ed-contact-block,.ed-contact-figure,.ed-form-wrap,.ed-quick a,.gc-form fieldset,.gc-total,.ed-article-body .prose>*,.ed-section-head';
 const els=[...document.querySelectorAll(sel)];if(!els.length)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 root.classList.add('rv-ready');
 els.forEach(el=>{el.classList.add('rv');const sib=[...el.parentElement.children].filter(c=>c.matches(sel));el.style.setProperty('--rvd',(Math.min(Math.max(sib.indexOf(el),0),5)*90)+'ms');});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rv-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.05});
 els.forEach(e=>io.observe(e));
})();
