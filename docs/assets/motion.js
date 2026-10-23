(()=>{
 if(self!==top){document.querySelectorAll('a[href]').forEach(a=>{if(!a.getAttribute('href').startsWith('#'))a.target='_top';});return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let opening=false,portal=null,shade=null,timer=null,origin=null;
 function cleanup(){clearTimeout(timer);portal?.remove();shade?.remove();portal=shade=null;document.body.style.overflow='';if(origin){origin.style.visibility='';origin.removeAttribute('aria-busy');}origin=null;opening=false;}
 addEventListener('popstate',cleanup);addEventListener('pageshow',e=>{if(e.persisted)cleanup();});
 document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('click',async e=>{
  if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();if(opening)return;opening=true;origin=card;card.setAttribute('aria-busy','true');
  const rect=card.getBoundingClientRect(),url=card.href,home=location.href;
  shade=document.createElement('div');shade.className='project-portal-shade';document.body.append(shade);
  // The opening window IS the selected card: its border starts at the exact clicked bounds.
  portal=document.createElement('div');portal.className='project-portal card-window';
  Object.assign(portal.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'22px'});
  const ghost=card.cloneNode(true);ghost.removeAttribute('href');ghost.removeAttribute('aria-busy');ghost.className='project-card window-original';
  Object.assign(ghost.style,{width:rect.width+'px',height:rect.height+'px'});portal.append(ghost);document.body.append(portal);
  document.body.style.overflow='hidden';card.style.visibility='hidden';
  // Play the full opening immediately, independently of network state. Never scale the cover.
  if(portal.animate){try{await portal.animate([{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'22px'},{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}],{duration:reduced?120:850,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'}).finished;}catch(_){}}
  if(!portal)return;
  // Only after the card has opened, prepare its detail page inside the same window.
  Object.assign(portal.style,{left:'0px',top:'0px',width:'100%',height:'100%',borderRadius:'0px'});
  const frame=document.createElement('iframe');frame.className='project-portal-frame';frame.title=card.querySelector('h2').textContent+' 项目详情';frame.style.visibility='hidden';frame.src=url;portal.append(frame);
  const reveal=()=>{if(!portal)return;let doc;try{doc=frame.contentDocument;if(!doc||doc.URL==='about:blank'||doc.readyState==='loading'||!doc.querySelector('main')){timer=setTimeout(reveal,100);return;}}catch(_){return;}
   // A single content replacement, with no fade, wipe, or second opening animation.
   frame.style.visibility='visible';ghost.remove();history.pushState({projectPortal:true,home},'',url);frame.focus();
  };reveal();
 }));
})();
