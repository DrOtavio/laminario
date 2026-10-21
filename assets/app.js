
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
  counter.textContent=String(n+1).padStart(2,'0')+' / '+slides.length;
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
deck.addEventListener('scroll',()=>{
  cancelAnimationFrame(frame);frame=requestAnimationFrame(detect);
},{passive:true});
for(const btn of [miniPrev,pagerPrev])btn.addEventListener('click',()=>go(current-1));
for(const btn of [miniNext,pagerNext])btn.addEventListener('click',()=>go(current+1));
caseSelect.addEventListener('change',()=>{
  const n=slides.findIndex(s=>s.dataset.case===caseSelect.value);
  if(n>=0)go(n,false);
});
deck.addEventListener('click',e=>{
 const t=e.target.closest('[data-goto]');
 if(t){e.preventDefault();go(+t.dataset.goto);return}
 const zoom=e.target.closest('[data-zoom]');
 if(zoom){fullImage.src=zoom.dataset.zoom;fullImage.alt=zoom.dataset.alt||'';fullscreen.classList.add('open');document.body.style.overflow='hidden'}
});
const close=()=>{fullscreen.classList.remove('open');document.body.style.overflow='';fullImage.removeAttribute('src')};
fullscreen.addEventListener('click',e=>{if(e.target===fullscreen||e.target.closest('.lightbox-close'))close()});
document.addEventListener('keydown',e=>{
 if(fullscreen.classList.contains('open')){if(e.key==='Escape')close();return}
 if(e.target.closest('input,select,textarea'))return;
 if(e.key==='ArrowRight')go(current+1);
 if(e.key==='ArrowLeft')go(current-1);
});
window.addEventListener('hashchange',()=>{
 const n=slides.findIndex(s=>'#'+s.id===location.hash);
 if(n>=0&&n!==current)go(n,false);
});
let initial=slides.findIndex(s=>'#'+s.id===location.hash);
if(initial<0)initial=0;
requestAnimationFrame(()=>go(initial,false));
})();
