// Keeps the original design's interactions (product panels, basket preview, search) and
// links them to the real storefront: mega-menu shop links and product detail links.
(()=>{const navigate=(e,url)=>{e.preventDefault();e.stopImmediatePropagation();location.assign(url)};
const productUrl=href=>{const m=/-p(\d+)(?:[/?#]|$)/.exec(href||'');const h=m&&window.VS_PRODUCTS&&window.VS_PRODUCTS[m[1]];return h?'/products/'+h:null};
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;
 if(t.tagName==='A'&&t.getAttribute('href')?.includes('#shop'))return navigate(e,'/shop?'+t.href.split('?')[1]);
 if(t.id==='modalSource'){const u=productUrl(t.getAttribute('href'));if(u)return navigate(e,u);}
},true);
const fix=()=>{const a=document.getElementById('modalSource');if(!a)return;const u=productUrl(a.getAttribute('href'));if(u){a.textContent='View full product details ↗';a.removeAttribute('target');}};
const pd=document.getElementById('productDialog');if(pd)new MutationObserver(fix).observe(pd,{attributes:true,subtree:true,attributeFilter:['href','open']});
})();
