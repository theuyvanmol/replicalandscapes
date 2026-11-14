// Header behaviour on shop, product and basket pages (the homepage uses app.js).
(()=>{const menu=document.getElementById('mobileNav'),btn=document.getElementById('menuBtn');
if(menu&&btn){btn.onclick=()=>{menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));};}
const go=(id,url)=>{const b=document.getElementById(id);if(b)b.onclick=()=>location.assign(url);};
go('basketBtn','/cart');go('searchBtn','/shop#search');
const c=document.getElementById('basketCount');if(c)fetch('/api/cart',{cache:'no-store'}).then(r=>r.json()).then(d=>{c.textContent=String(d.count||0);const b=document.getElementById('basketBtn');if(b)b.setAttribute('aria-label','Open basket, '+(d.count||0)+' items');}).catch(()=>{});
})();
