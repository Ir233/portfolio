(()=>{
 const script=document.currentScript.src,names=['horror','hirata','peace','distortion','practice'],labels=['惊悚乐园','平田的世界','和平精英','失真地','个人练习'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const valid=url=>{try{const u=new URL(url,location.href);return u.origin===location.origin&&names.includes(u.pathname.split('/').pop().replace('.html',''));}catch(_){return false;}};
 document.addEventListener('click',e=>{const a=e.target.closest('.site-sidebar nav a');if(!a||!valid(a.href)||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(new URL(a.href).pathname===location.pathname)return;e.preventDefault();e.stopImmediatePropagation();const r=a.getBoundingClientRect(),rect={left:r.left,top:r.top,width:r.width,height:r.height};document.querySelector('#nav-close')?.click();if(self!==top)top.postMessage({type:'portfolio-project-switch',url:a.href,rect},location.origin);else switchTo(a.href,rect);},true);
 if(self!==top)return;
 let busy=false,overlay=null,live=null,poll=null;const cache=new Map();
 function frame(name){const f=document.createElement('iframe');f.src=new URL('previews/'+name+'.html',script).href;f.title=labels[names.indexOf(name)]+' 预演';f.tabIndex=-1;f.setAttribute('aria-hidden','true');return f;}
 function prepare(){names.forEach(n=>{if(cache.has(n))return;const f=frame(n);f.className='switch-preload';Object.assign(f.style,{width:innerWidth+'px',height:innerHeight+'px'});document.body.append(f);cache.set(n,f);});}
 if('requestIdleCallback'in window)requestIdleCallback(prepare,{timeout:1200});else setTimeout(prepare,500);
 function reset(){clearTimeout(poll);overlay?.remove();live?.remove();overlay=live=null;busy=false;document.body.style.overflow='';}addEventListener('popstate',reset);
 addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='portfolio-project-switch'&&valid(e.data.url))switchTo(e.data.url,e.data.rect);});
 async function switchTo(url,rect){
  if(busy)return;busy=true;prepare();document.body.style.overflow='hidden';
  const name=new URL(url).pathname.split('/').pop().replace('.html',''),index=names.indexOf(name);
  const r=rect&&Number.isFinite(rect.left)&&Number.isFinite(rect.top)?rect:{left:20,top:innerHeight-100,width:200,height:48};
  overlay=document.createElement('div');overlay.className='switch-window menu-expand-window';Object.assign(overlay.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'12px'});
  const mock=cache.get(name)||frame(name);cache.delete(name);mock.className='switch-page-preview';Object.assign(mock.style,{width:innerWidth+'px',height:innerHeight+'px',left:-r.left+'px',top:-r.top+'px'});overlay.append(mock);document.body.append(overlay);if(live)live.style.zIndex='7999';
  // Only one direct expansion, anchored to the menu item the user actually clicked.
  const duration=reduced?100:480,easing='cubic-bezier(.22,.75,.18,1)';
  mock.animate([{left:-r.left+'px',top:-r.top+'px'},{left:'0px',top:'0px'}],{duration,easing,fill:'forwards'});
  const a=overlay.animate([{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'12px'},{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}],{duration,easing,fill:'forwards'});
  const next=document.createElement('iframe');next.className='switch-live';next.title=labels[index]+' 项目详情';next.style.visibility='hidden';next.src=url;document.body.append(next);
  try{await Promise.race([a.finished,new Promise(resolve=>setTimeout(resolve,duration+200))]);a.finish();}catch(_){}
  if(!overlay){next.remove();return;}
  const finish=()=>{if(!overlay)return;let d;try{d=next.contentDocument;if(!d||d.URL==='about:blank'||d.readyState==='loading'||!d.querySelector('main')){poll=setTimeout(finish,100);return;}}catch(_){return;}
   next.style.visibility='visible';live?.remove();live=next;overlay.remove();overlay=null;history.pushState({projectSwitch:true},'',url);busy=false;live.focus();prepare();
  };finish();
 }
})();
