// Ends the homepage intro: remembers it for this visit, allows skipping, unlocks scrolling.
(()=>{const el=document.getElementById('intro');const root=document.documentElement;if(!el||root.classList.contains('no-intro'))return;
 root.classList.add('intro-playing');try{sessionStorage.setItem('rl-intro','1')}catch(e){}
 const done=()=>{root.classList.remove('intro-playing');el.remove();};
 el.addEventListener('animationend',e=>{if(e.target===el&&e.animationName==='intro-out')done();});
 const skip=()=>{el.style.transition='opacity .35s';el.style.animation='none';el.style.opacity='0';setTimeout(done,360);};
 el.addEventListener('click',skip);addEventListener('keydown',e=>{if(e.key==='Escape'||e.key===' '||e.key==='Enter')skip();},{once:true});
 addEventListener('wheel',skip,{once:true,passive:true});addEventListener('touchmove',skip,{once:true,passive:true});
 setTimeout(()=>{if(document.body.contains(el))done();},5000);
})();
