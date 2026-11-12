// Header behaviour on shop, product and basket pages (the homepage uses app.js).
(()=>{const menu=document.getElementById('mobileNav'),btn=document.getElementById('menuBtn');
if(menu&&btn){btn.onclick=()=>{menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));};}
const go=(id,url)=>{const b=document.getElementById(id);if(b)b.onclick=()=>location.assign(url);};
go('basketBtn','/cart');go('searchBtn','/shop#search');
})();
