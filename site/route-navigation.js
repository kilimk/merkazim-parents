'use strict';
let disposeRouteNavigation=()=>{};
function scrollToPageAnchor(hash){
 let id;try{id=decodeURIComponent(hash.replace(/^#/,''))}catch{return}
 const target=document.getElementById(id);if(!target)return;
 for(let parent=target;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 target.scrollIntoView({block:'start'});
}
function bindRouteNavigation(){
 disposeRouteNavigation();
 const layout=document.querySelector('.article-layout');if(!layout)return;
 const sections=[...layout.querySelectorAll('.article-body > section[id]')];
 const links=[...layout.querySelectorAll('.toc a[href^="#"]')];
 const back=document.createElement('button');back.className='route-return btn secondary';back.type='button';back.hidden=true;back.textContent='← Вернуться к месту чтения';layout.append(back);
 let frame=0,origin=null,active=null;
 function update(){
  frame=0;const boundary=(document.querySelector('.topbar')?.getBoundingClientRect().bottom||0)+45;
  let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=boundary)current=section;else break}
  if(!current||active===current.id)return;active=current.id;
  for(const link of links){const selected=link.hash==='#'+current.id;link.classList.toggle('is-current',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  const selected=links.find(a=>a.hash==='#'+current.id),toc=layout.querySelector('.toc');
  if(selected&&getComputedStyle(toc).position==='sticky'){
   const a=selected.getBoundingClientRect(),b=toc.getBoundingClientRect();
   if(a.top<b.top)toc.scrollTop-=b.top-a.top+8;else if(a.bottom>b.bottom)toc.scrollTop+=a.bottom-b.bottom+8;
  }
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 function jump(e){
  const link=e.target.closest('a[href^="#"]');if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  let id;try{id=decodeURIComponent(link.hash.slice(1))}catch{return}
  const target=document.getElementById(id);if(!target)return;
  e.preventDefault();origin={element:link,y:scrollY,hash:location.hash};back.hidden=false;
  history.pushState({},'',link.hash);scrollToPageAnchor(link.hash);
  const focusTarget=target.tagName==='DETAILS'?target.querySelector('summary'):target;
  if(focusTarget){if(!focusTarget.hasAttribute('tabindex')&&focusTarget.tagName!=='SUMMARY')focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true})}
  schedule();
 }
 function returnToReading(){if(!origin)return;history.replaceState({},'',location.pathname+location.search+origin.hash);window.scrollTo({top:origin.y,behavior:'instant'});origin.element.focus({preventScroll:true});back.hidden=true;origin=null;schedule()}
 layout.addEventListener('click',jump);back.addEventListener('click',returnToReading);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);layout.addEventListener('toggle',schedule,true);
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;resize?.observe(layout);
 schedule();
 disposeRouteNavigation=()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);layout.removeEventListener('toggle',schedule,true);layout.removeEventListener('click',jump);resize?.disconnect();back.remove()};
}
