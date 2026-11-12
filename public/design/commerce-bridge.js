// Replace prototype purchase paths with the real storefront. Capture before legacy handlers.
(()=>{const navigate=(e,url)=>{e.preventDefault();e.stopImmediatePropagation();location.assign(url)};
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;
 if(t.id==='basketBtn')return navigate(e,'/cart');if(t.id==='searchBtn')return navigate(e,'/shop');
 if(t.matches('[data-product],#heroHotspot,[data-arrival]'))return navigate(e,'/shop');
 if(t.tagName!=='A'&&t.closest('#productGrid,#arrivals'))return navigate(e,'/shop');
 if(t.tagName==='A'&&t.getAttribute('href')?.includes('#shop'))return navigate(e,'/shop?'+t.href.split('?')[1]);
},true);
})();
