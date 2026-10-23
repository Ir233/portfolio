(()=>{
 if(self!==top){document.querySelectorAll('a[href]').forEach(a=>{if(!a.getAttribute('href').startsWith('#'))a.target='_top';});return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let opening=false,portal=null,shade=null,timers=[],origin=null;
 function cleanup(){timers.forEach(clearTimeout);timers=[];portal?.remove();shade?.remove();portal=shade=null;document.body.style.overflow='';if(origin){origin.style.visibility='';origin.removeAttribute('aria-busy');}origin=null;opening=false;}
 addEventListener('popstate',cleanup);addEventListener('pageshow',e=>{if(e.persisted)cleanup();});
 const animate=async(el,frames,options)=>{if(!el.animate)return;try{await el.animate(frames,options).finished;}catch(_){}};
 document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',async e=>{
  if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();if(opening)return;opening=true;origin=card;card.setAttribute('aria-busy','true');
  const rect=card.getBoundingClientRect(),url=card.href,home=location.href;
  const inset=`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px round 18px)`;
  shade=document.createElement('div');shade.className='project-portal-shade';document.body.append(shade);
  portal=document.createElement('div');portal.className='project-portal';portal.style.clipPath=inset;portal.style.webkitClipPath=inset;
  const ghost=card.cloneNode(true);ghost.removeAttribute('href');ghost.removeAttribute('aria-busy');ghost.className='project-card portal-original';
  Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});portal.append(ghost);
  const loading=document.createElement('div');loading.className='portal-loading';loading.setAttribute('role','status');loading.setAttribute('aria-live','polite');
  const message=document.createElement('span');message.textContent='正在打开项目…';const direct=document.createElement('a');direct.href=url;direct.textContent='直接打开 →';direct.hidden=true;loading.append(message,direct);portal.append(loading);
  document.body.append(portal);document.body.style.overflow='hidden';card.style.visibility='hidden';
  // Start visual feedback before any request. Never wait for iframe load or video metadata.
  const shellReady=animate(portal,[{clipPath:inset,webkitClipPath:inset},{clipPath:'inset(0px round 0px)',webkitClipPath:'inset(0px round 0px)'}],{duration:reduced?120:720,easing:'cubic-bezier(.22,.7,.18,1)',fill:'forwards'}).then(()=>{if(portal){portal.style.clipPath='none';portal.style.webkitClipPath='none';}});
  const frame=document.createElement('iframe');frame.className='project-portal-frame';frame.title=card.querySelector('h2').textContent+' 项目详情';frame.style.visibility='hidden';frame.src=url;portal.prepend(frame);
  let finished=false;
  const slow=setTimeout(()=>{if(!finished){message.textContent='网络较慢，正在加载项目…';direct.hidden=false;}},4500);timers.push(slow);
  const check=async()=>{
   if(!portal||finished)return;
   let doc;try{doc=frame.contentDocument;if(!doc||doc.URL==='about:blank'||doc.readyState==='loading'||!doc.querySelector('main')){timers.push(setTimeout(check,100));return;}}catch(_){message.textContent='暂时无法载入';direct.hidden=false;return;}
   finished=true;clearTimeout(slow);
   // Avoid revealing fallback typography; fonts never block feedback or opening.
   if(doc.fonts)await Promise.race([doc.fonts.ready,new Promise(r=>{timers.push(setTimeout(r,600));})]);
   await shellReady;if(!portal)return;
   frame.style.clipPath='inset(0px 0px 100% 0px)';frame.style.webkitClipPath=frame.style.clipPath;frame.style.visibility='visible';
   loading.remove();
   // Reveal the real page as a continuous window, without opacity fades or a second navigation.
   await animate(frame,[{clipPath:'inset(0px 0px 100% 0px)',webkitClipPath:'inset(0px 0px 100% 0px)'},{clipPath:'inset(0px)',webkitClipPath:'inset(0px)'}],{duration:reduced?100:650,easing:'cubic-bezier(.25,.65,.2,1)',fill:'forwards'});
   if(!portal)return;frame.style.clipPath='none';frame.style.webkitClipPath='none';ghost.remove();history.pushState({projectPortal:true,home},'',url);frame.focus();
  };check();
 }));
})();
