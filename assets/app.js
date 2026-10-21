(()=>{
'use strict';
const deck=document.getElementById('deck');
if(!deck)return;
const slides=[...deck.querySelectorAll('.slide')];
const counter=document.getElementById('counter');
const caseSelect=document.getElementById('caseSelect');
const miniPrev=document.getElementById('prevMini');
const miniNext=document.getElementById('nextMini');
const pagerPrev=document.getElementById('pagerPrev');
const pagerNext=document.getElementById('pagerNext');
const pagerCounter=document.getElementById('pagerCounter');
const fullscreen=document.getElementById('lightbox');
const fullImage=document.getElementById('fullImage');
let current=0;
let busy=false;
let lastImageSwipe=0;
function initSlide(slide){
  const images=JSON.parse(slide.dataset.images||'[]');
  slide._images=images;
  slide._imageIndex=0;
  const img=slide.querySelector('.case-image');
  const count=slide.querySelector('.img-count');
  const status=slide.querySelector('.img-status');
  const thumbs=[...slide.querySelectorAll('[data-thumb-index]')];
  const zoom=slide.querySelector('.zoom-btn');
  function renderImage(i){
    if(!images.length)return;
    i=(i+images.length)%images.length;
    slide._imageIndex=i;
    img.src=images[i];
    img.alt=`Microfotografía ${i+1}: ${slide.dataset.diagnosis||''}`;
    count.textContent=`IMAGEN ${i+1}/${images.length}`;
    status.textContent=`${i+1} / ${images.length}`;
    thumbs.forEach((t,idx)=>t.classList.toggle('active',idx===i));
    if(zoom) zoom.dataset.zoom=images[i];
    if(zoom) zoom.dataset.alt=slide.dataset.diagnosis||'';
  }
  slide._renderImage=renderImage;
  renderImage(0);
  slide.querySelector('[data-img-prev]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();renderImage(slide._imageIndex-1)});
  slide.querySelector('[data-img-next]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();renderImage(slide._imageIndex+1)});
  thumbs.forEach((t,idx)=>t.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();renderImage(idx)}));
  img.addEventListener('click',()=>{if(Date.now()-lastImageSwipe<420)return;if(zoom){fullImage.src=zoom.dataset.zoom;fullImage.alt=zoom.dataset.alt||'';fullscreen.classList.add('open');document.body.style.overflow='hidden';}});
  zoom?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fullImage.src=zoom.dataset.zoom;fullImage.alt=zoom.dataset.alt||'';fullscreen.classList.add('open');document.body.style.overflow='hidden';});
}
slides.forEach(initSlide);
// Deslizar a izquierda/derecha cambia la imagen de la patología activa,
// sin desplazar el card ni alterar la información histopatológica.
let touchStart=null;
deck.addEventListener('touchstart',e=>{
 if(e.touches.length!==1){touchStart=null;return}
 // La tira de miniaturas tiene desplazamiento propio.
 if(e.target.closest('.thumbstrip,button,select,a')){touchStart=null;return}
 const slide=e.target.closest('.slide');
 if(!slide){touchStart=null;return}
 touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,slide};
},{passive:true});
deck.addEventListener('touchend',e=>{
 if(!touchStart||!e.changedTouches.length)return;
 const start=touchStart;touchStart=null;
 const dx=e.changedTouches[0].clientX-start.x;
 const dy=e.changedTouches[0].clientY-start.y;
 if(Math.abs(dx)<42||Math.abs(dx)<Math.abs(dy)*1.35)return;
 if(!start.slide._images||start.slide._images.length<2)return;
 lastImageSwipe=Date.now();
 start.slide._renderImage(start.slide._imageIndex+(dx<0?1:-1));
},{passive:true});
deck.addEventListener('touchcancel',()=>{touchStart=null},{passive:true});
const go=(n,smooth=true)=>{
  n=(n+slides.length)%slides.length;
  current=n;busy=true;
  deck.scrollTo({left:slides[n].offsetLeft-deck.offsetLeft,behavior:smooth?'smooth':'instant'});
  sync(n);
  clearTimeout(go.timer);
  go.timer=setTimeout(()=>{busy=false},300);
};
function sync(n){
  const s=slides[n];
  counter.textContent=String(n+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
  pagerCounter.textContent=(n+1)+' / '+slides.length;
  caseSelect.value=s.dataset.case;
  history.replaceState(null,'','#'+s.id);
}
function detect(){
  if(busy)return;
  const n=Math.round(deck.scrollLeft/deck.clientWidth);
  if(n>=0&&n<slides.length&&n!==current){current=n;sync(n)}
}
let frame=0;
deck.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(detect)},{passive:true});
for(const btn of [miniPrev,pagerPrev]) btn?.addEventListener('click',()=>go(current-1));
for(const btn of [miniNext,pagerNext]) btn?.addEventListener('click',()=>go(current+1));
caseSelect?.addEventListener('change',()=>{const n=slides.findIndex(s=>s.dataset.case===caseSelect.value); if(n>=0)go(n,false);});
const close=()=>{fullscreen.classList.remove('open');document.body.style.overflow='';fullImage.removeAttribute('src')};
fullscreen?.addEventListener('click',e=>{if(e.target===fullscreen||e.target.closest('.lightbox-close'))close()});
document.addEventListener('keydown',e=>{
 if(fullscreen.classList.contains('open')){if(e.key==='Escape')close();return}
 if(e.target.closest('input,select,textarea'))return;
 const slide=slides[current];
 if(e.key==='ArrowRight'&&slide._images.length>1)slide._renderImage(slide._imageIndex+1)
 if(e.key==='ArrowLeft'&&slide._images.length>1)slide._renderImage(slide._imageIndex-1)
});
window.addEventListener('hashchange',()=>{const n=slides.findIndex(s=>'#'+s.id===location.hash);if(n>=0&&n!==current)go(n,false)});
let initial=slides.findIndex(s=>'#'+s.id===location.hash); if(initial<0)initial=0; requestAnimationFrame(()=>go(initial,false));
})();
