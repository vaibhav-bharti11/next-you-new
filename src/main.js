import { renderStorefront } from './storefront.js';
import { initPageMotion } from './page-motion.js';
import './reference.css';
import './finishing.css';
import './premium.css';
renderStorefront();
const bag = document.querySelector('#bag');
let selected = false;
try { selected = localStorage.getItem('nextyou-preview-selection') === 'yes'; } catch {}
function renderBag() {
  document.querySelector('#count').textContent = selected ? '1' : '0';
  document.querySelector('#bag-content').innerHTML = selected ? `<div class="bag-item"><img src="/assets/bottle.png" alt="CIRCADEN"><div><h3>CIRCADEN™</h3><p>Sleep + Recovery · 60 veg capsules</p><button id="remove-item">Remove</button></div></div><p>Explore the CIRCADEN product story.</p><a class="pill" href="/products/circaden">Continue to product</a><p>No payment or order is created here.</p>` : `<p>Your bag is waiting for your next chapter.</p><a class="pill" href="/products/circaden">Explore CIRCADEN</a>`;
  document.querySelector('#remove-item')?.addEventListener('click', () => setSelection(false));
}
function setSelection(value) { selected=value;try{localStorage.setItem('nextyou-preview-selection',value?'yes':'no')}catch{}renderBag(); }
document.querySelector('#bag-open').addEventListener('click',()=>bag.showModal());
document.querySelector('.close').addEventListener('click',()=>bag.close());
document.querySelector('#add-bag').addEventListener('click',()=>{setSelection(true);bag.showModal()});
document.addEventListener('nextyou:bag-updated',()=>{setSelection(true);bag.showModal()});
const menu=document.querySelector('#mobile-menu');
document.querySelector('#menu-open').addEventListener('click',event=>{menu.hidden=!menu.hidden;event.currentTarget.setAttribute('aria-expanded',String(!menu.hidden))});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.hidden=true}));
const rotation=document.querySelector('#product-rotation');rotation.src='/assets/circaden-rotation-clean.mp4';
const turntable=document.querySelector('.turntable'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
function playRotation(){rotation.currentTime=0;rotation.play().then(()=>{turntable.setAttribute('aria-pressed','true');turntable.classList.add('is-playing')}).catch(()=>{});}
function resetRotation(){rotation.pause();rotation.currentTime=0;turntable.setAttribute('aria-pressed','false');turntable.classList.remove('is-playing');}
turntable.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!reduced.matches)playRotation()});
turntable.addEventListener('pointerleave',resetRotation);
turntable.addEventListener('focus',()=>{if(turntable.matches(':focus-visible')&&!reduced.matches)playRotation()});
turntable.addEventListener('blur',resetRotation);
turntable.addEventListener('click',event=>{if(event.pointerType==='mouse')return;rotation.paused?playRotation():resetRotation()});
const capsuleSection=document.querySelector('.science'),capsuleVideo=document.querySelector('.capsule-breakdown');
if(location.pathname==='/'&&capsuleSection&&capsuleVideo){
  capsuleVideo.pause();
  if(!reduced.matches){
    let capsuleFrame=0;
    const syncCapsuleToScroll=()=>{
      capsuleFrame=0;
      const bounds=capsuleSection.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(innerHeight-bounds.top)/(bounds.height+innerHeight)));
      capsuleVideo.style.setProperty('--capsule-scale',(0.78+progress*0.62).toFixed(3));
      if(capsuleVideo.readyState>=1&&capsuleVideo.duration){
        const frameTime=Math.round(progress*capsuleVideo.duration*24)/24;
        if(Math.abs(capsuleVideo.currentTime-frameTime)>0.02)capsuleVideo.currentTime=Math.min(frameTime,capsuleVideo.duration-0.001);
      }
    };
    const requestCapsuleSync=()=>{if(!capsuleFrame)capsuleFrame=requestAnimationFrame(syncCapsuleToScroll)};
    addEventListener('scroll',requestCapsuleSync,{passive:true});
    addEventListener('resize',requestCapsuleSync);
    capsuleVideo.addEventListener('loadedmetadata',requestCapsuleSync);
    requestCapsuleSync();
  }
}
const header=document.querySelector('.seed-header');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});
function closeMenus(){document.querySelectorAll('.nav-popover').forEach(p=>p.hidden=true);document.querySelectorAll('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'))}
document.querySelectorAll('[data-menu]').forEach(button=>button.addEventListener('click',()=>{const panel=document.querySelector('#nav-'+button.dataset.menu),open=panel.hidden;closeMenus();panel.hidden=!open;button.setAttribute('aria-expanded',String(open))}));
document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();menu.hidden=true}});
document.querySelectorAll('.nav-popover a').forEach(a=>a.addEventListener('click',closeMenus));
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const image=document.querySelector('#highlight-image');image.classList.add('is-changing');document.querySelectorAll('[data-photo]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));const next='/assets/'+button.dataset.photo+'.png';const finish=()=>{image.src=next;requestAnimationFrame(()=>requestAnimationFrame(()=>image.classList.remove('is-changing')))};window.setTimeout(finish,180)}));
const film=document.querySelector('#feature-film'),toggle=document.querySelector('#video-toggle'),mute=document.querySelector('#film-mute');
toggle.addEventListener('click',()=>film.paused?film.play().catch(()=>{}):film.pause());
film.addEventListener('play',()=>{toggle.textContent='Ⅱ';toggle.setAttribute('aria-label','Pause film')});
film.addEventListener('pause',()=>{toggle.textContent='▶';toggle.setAttribute('aria-label','Play film')});
mute.addEventListener('click',()=>{film.muted=!film.muted;mute.setAttribute('aria-label',film.muted?'Unmute film':'Mute film')});
document.querySelector('.fullscreen').addEventListener('click',()=>film.requestFullscreen?.().catch(()=>{}));
if(reduced.matches)document.querySelectorAll('video[autoplay]').forEach(v=>{v.autoplay=false;v.pause()});
const storyStrip=document.querySelector('.media-strip'),storyTrack=document.querySelector('.media-track');if(storyStrip&&storyTrack&&!reduced.matches){let storyFrame=0;const updateStories=()=>{storyFrame=0;if(matchMedia('(max-width:700px)').matches){storyTrack.style.transform='';return}const rect=storyStrip.getBoundingClientRect(),travel=Math.max(0,storyTrack.scrollWidth-innerWidth+64),scrollInto=Math.max(0,innerHeight*.42-rect.top),shift=Math.min(travel,scrollInto*.45);storyTrack.style.transform='translate3d('+(-shift)+'px,0,0)'};const requestStories=()=>{if(!storyFrame)storyFrame=requestAnimationFrame(updateStories)};addEventListener('scroll',requestStories,{passive:true});addEventListener('resize',requestStories);requestStories()}
if(!reduced.matches&&'IntersectionObserver'in window){const motionSections=document.querySelectorAll('.intro,.science,.products,.body-clock,.transparency,.highlight,.film-section,.stories-heading,.media-strip,.bookend');motionSections.forEach(section=>section.classList.add('motion-enter'));const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-visible');motionObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});motionSections.forEach(section=>motionObserver.observe(section))}
renderBag();


import { mountPages } from './pages.js';
import './pages.css';
mountPages();
initPageMotion();
if(new URLSearchParams(location.search).get('bag')==='open')bag.showModal();
