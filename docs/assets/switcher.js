(()=>{
 const script=document.currentScript.src,root=new URL('../',script),names=['horror','hirata','peace','distortion','practice'],labels=['惊悚乐园','平田的世界','和平精英','失真地','个人练习'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const valid=url=>{try{const u=new URL(url,location.href);return u.origin===location.origin&&names.includes(u.pathname.split('/').pop().replace('.html',''));}catch(_){return false;}};
 document.addEventListener('click',e=>{const a=e.target.closest('.site-sidebar nav a');if(!a||!valid(a.href)||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(new URL(a.href).pathname===location.pathname)return;e.preventDefault();e.stopImmediatePropagation();document.querySelector('#nav-close')?.click();if(self!==top){top.postMessage({type:'portfolio-project-switch',url:a.href},location.origin);}else switchTo(a.href);},true);
 if(self!==top)return;
 let busy=false,overlay=null,live=null,poll=null;
 const animate=async(el,f,d=600)=>{try{const duration=reduced?100:d,a=el.animate(f,{duration,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'});await Promise.race([a.finished,new Promise(r=>setTimeout(r,duration+250))]);a.finish();}catch(_){}};
 function frame(name){const f=document.createElement('iframe');f.src=new URL('previews/'+name+'.html',script).href;f.title=labels[names.indexOf(name)]+' 预演';f.tabIndex=-1;f.setAttribute('aria-hidden','true');return f;}
 // Prepare lightweight project stills during idle time, without executing project video scripts.
 const cache=new Map();const prepare=()=>names.forEach(n=>{if(cache.has(n))return;const f=frame(n);f.className='switch-preload';Object.assign(f.style,{width:innerWidth+'px',height:innerHeight+'px'});document.body.append(f);cache.set(n,f);});
 if('requestIdleCallback'in window)requestIdleCallback(prepare,{timeout:1600});else setTimeout(prepare,700);
 function take(name){const f=cache.get(name)||frame(name);cache.delete(name);f.className='switch-page-preview';Object.assign(f.style,{width:innerWidth+'px',height:innerHeight+'px'});return f;}
 function reset(){clearTimeout(poll);overlay?.remove();live?.remove();overlay=live=null;busy=false;document.body.style.overflow='';}
 addEventListener('popstate',reset);
 addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='portfolio-project-switch'&&valid(e.data.url))switchTo(e.data.url);});
 async function switchTo(url){
  if(busy)return;busy=true;prepare();document.body.style.overflow='hidden';
  const target=names.indexOf(new URL(url).pathname.split('/').pop().replace('.html',''));
  const current=Math.max(0,names.indexOf(location.pathname.split('/').pop().replace('.html','')));
  overlay=document.createElement('div');overlay.className='project-switcher';
  const heading=document.createElement('div');heading.className='switch-heading';heading.textContent='作品 / PROJECTS';overlay.append(heading);
  const stack=document.createElement('div');stack.className='switch-stack';overlay.append(stack);
  const tiles=names.map((n,i)=>{const t=document.createElement('div');t.className='switch-tile';const p=take(n);p.style.transform='scale(.3)';t.append(p);const label=document.createElement('span');label.textContent=String(i+1).padStart(2,'0')+' / '+labels[i];t.append(label);stack.append(t);return t;});
  document.body.append(overlay);if(live){live.remove();live=null;}
  // Keep all five projects in order on screen; each tile is a lightweight rendering of that page.
  tiles.forEach(t=>{t.querySelector('iframe').style.transform='scale('+(t.clientWidth/innerWidth)+')';});
  const shell=document.createElement('div');shell.className='switch-window';const currentPreview=tiles[current].querySelector('iframe');currentPreview.style.transform='none';shell.append(currentPreview);overlay.append(shell);
  const first=tiles[current].getBoundingClientRect();
  const asRect=r=>({left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'20px'});
  await animate(shell,[{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'},asRect(first)],620);
  if(!overlay)return;tiles[current].prepend(currentPreview);currentPreview.style.transform='scale('+(tiles[current].clientWidth/innerWidth)+')';shell.remove();tiles[current].classList.add('switch-current');
  // Automatic focus moves through the ordered list; no second tap is needed.
  const marker=document.createElement('div');marker.className='switch-selection';overlay.append(marker);
  const last=tiles[target].getBoundingClientRect();
  await animate(marker,[asRect(first),asRect(last)],360);
  if(!overlay)return;tiles[target].classList.add('switch-target');
  const expanding=document.createElement('div');expanding.className='switch-window';expanding.append(tiles[target].querySelector('iframe'));overlay.append(expanding);
  const mock=expanding.querySelector('iframe');mock.style.transform='none';
  live=document.createElement('iframe');live.className='switch-live';live.title=labels[target]+' 项目详情';live.style.visibility='hidden';live.src=url;document.body.append(live);
  await animate(expanding,[asRect(last),{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}],720);
  if(!overlay)return;
  const finish=()=>{if(!overlay||!live)return;let d;try{d=live.contentDocument;if(!d||d.URL==='about:blank'||d.readyState==='loading'||!d.querySelector('main')){poll=setTimeout(finish,100);return;}}catch(_){return;}
   live.style.visibility='visible';overlay.remove();overlay=null;history.pushState({projectSwitch:true},'',url);busy=false;live.focus();prepare();
  };finish();
 }
})();
