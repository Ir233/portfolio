(()=>{
 if(window.self!==window.top){document.querySelectorAll('a[href]').forEach(a=>{if(!a.getAttribute('href').startsWith('#'))a.target='_top';});return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let launching=false,portal=null,backdrop=null;
 const home=location.href;
 function cleanup(){portal?.remove();backdrop?.remove();portal=backdrop=null;document.body.style.overflow='';document.querySelectorAll('.project-card').forEach(c=>c.style.visibility='');launching=false;}
 addEventListener('popstate',cleanup);
 document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',async e=>{
  if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();if(launching)return;launching=true;
  const rect=card.getBoundingClientRect(),url=card.href;
  // Load the real next page at viewport size before opening its reveal window.
  const frame=document.createElement('iframe');frame.title=card.querySelector('h2').textContent+' 项目详情';frame.src=url;frame.className='project-portal-frame';
  portal=document.createElement('div');portal.className='project-portal';portal.style.visibility='hidden';portal.append(frame);document.body.append(portal);
  const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
  // Mobile video metadata may delay iframe load: never bypass the opening animation.
  await Promise.race([loaded,new Promise(resolve=>setTimeout(resolve,350))]);
  backdrop=document.createElement('div');backdrop.className='project-portal-shade';document.body.append(backdrop);
  const ghost=card.cloneNode(true);ghost.removeAttribute('href');ghost.className='project-card portal-original';
  Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});portal.append(ghost);
  const start=`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px round 18px)`;
  portal.style.clipPath=start;portal.style.webkitClipPath=start;portal.style.visibility='visible';document.body.style.overflow='hidden';card.style.visibility='hidden';
  backdrop.animate([{opacity:0},{opacity:1}],{duration:850,fill:'forwards'});
  // The cover never scales: it dissolves in place while the border reveals the next page.
  ghost.animate([{opacity:1},{opacity:1,offset:.15},{opacity:0}],{duration:800,fill:'forwards',easing:'ease-in-out'});
  frame.animate([{opacity:0},{opacity:.15,offset:.2},{opacity:1}],{duration:950,fill:'forwards',easing:'ease-in-out'});
  if(reduced){await portal.animate([{opacity:0},{opacity:1}],{duration:180,fill:'forwards'}).finished;}else{await portal.animate([{clipPath:start,webkitClipPath:start},{clipPath:'inset(0px 0px 0px 0px round 0px)',webkitClipPath:'inset(0px 0px 0px 0px round 0px)'}],{duration:1100,easing:'cubic-bezier(.32,0,.16,1)',fill:'forwards'}).finished;}
  ghost.remove();portal.style.clipPath='none';portal.style.webkitClipPath='none';history.pushState({projectPortal:true,home},'',url);frame.focus();
 }));
})();
