(()=>{
 if(self!==top){document.querySelectorAll('a[href]').forEach(a=>{if(!a.getAttribute('href').startsWith('#'))a.target='_top';});return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let opening=false,portal=null,shade=null,timer=null,origin=null;
 const prepared=new Map();
 function preview(card){if(prepared.has(card))return prepared.get(card);const f=document.createElement('iframe');f.className='prepared-preview';f.title='项目页面预演';f.tabIndex=-1;f.setAttribute('aria-hidden','true');f.src='assets/previews/'+new URL(card.href).pathname.split('/').pop();Object.assign(f.style,{width:innerWidth+'px',height:innerHeight+'px'});document.body.append(f);prepared.set(card,f);return f;}
 // Static next-page renders contain no scripts or video requests. Prepare before the click.
 const cards=[...document.querySelectorAll('.project-card')];
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){preview(e.target);observer.unobserve(e.target);}}),{rootMargin:'600px'});cards.forEach(c=>observer.observe(c));}else cards.forEach(preview);
 function cleanup(){clearTimeout(timer);portal?.remove();shade?.remove();portal=shade=null;document.body.style.overflow='';if(origin){origin.style.visibility='';origin.removeAttribute('aria-busy');}origin=null;opening=false;}
 addEventListener('popstate',cleanup);addEventListener('pageshow',e=>{if(e.persisted)cleanup();});
 cards.forEach(card=>card.addEventListener('click',async e=>{
  if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();if(opening)return;opening=true;origin=card;card.setAttribute('aria-busy','true');
  const rect=card.getBoundingClientRect(),url=card.href,home=location.href;
  shade=document.createElement('div');shade.className='project-portal-shade';document.body.append(shade);
  portal=document.createElement('div');portal.className='project-portal card-window';
  Object.assign(portal.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'22px'});
  // Use the already-rendered next page inside the expanding border, rather than an empty shell.
  const mock=preview(card);prepared.delete(card);mock.className='project-preview-live';Object.assign(mock.style,{left:-rect.left+'px',top:-rect.top+'px',width:innerWidth+'px',height:innerHeight+'px'});portal.append(mock);
  const ghost=card.cloneNode(true);ghost.removeAttribute('href');ghost.className='project-card window-original';Object.assign(ghost.style,{width:rect.width+'px',height:rect.height+'px'});portal.append(ghost);
  document.body.append(portal);document.body.style.overflow='hidden';card.style.visibility='hidden';
  // The original card slides out of its own window while the pre-rendered detail is uncovered.
  const duration=reduced?120:950;
  if(ghost.animate)ghost.animate([{clipPath:'inset(0px)'},{clipPath:'inset(0px 0px 100% 0px)'}],{duration:duration*.7,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'});
  const frame=document.createElement('iframe');frame.className='project-portal-frame';frame.title=card.querySelector('h2').textContent+' 项目详情';frame.style.visibility='hidden';frame.src=url;portal.append(frame);
  if(mock.animate)mock.animate([{left:-rect.left+'px',top:-rect.top+'px'},{left:'0px',top:'0px'}],{duration,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'});
  if(portal.animate){try{await portal.animate([{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'22px'},{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}],{duration,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'}).finished;}catch(_){}}
  if(!portal)return;ghost.remove();Object.assign(portal.style,{left:'0px',top:'0px',width:'100%',height:'100%',borderRadius:'0px'});
  const reveal=()=>{if(!portal)return;let doc;try{doc=frame.contentDocument;if(!doc||doc.URL==='about:blank'||doc.readyState==='loading'||!doc.querySelector('main')){timer=setTimeout(reveal,100);return;}}catch(_){return;}
   // Identical geometry: the live page replaces its preview without another visual transition.
   frame.style.visibility='visible';mock.remove();history.pushState({projectPortal:true,home},'',url);frame.focus();
  };reveal();
 }));
})();
