/* Laminário 6F · UI enhancements, independent of existing slideshow engine. */
(()=>{
 'use strict';
 const toggle = document.getElementById('studyToggle');
 const slides = [...document.querySelectorAll('.slide')];
 const select = document.getElementById('caseSelect');
 const counter = document.getElementById('counter');
 const progress = document.querySelector('.case-progress-bar');
 if(!slides.length) return;
 const originalLabels = select ? [...select.options].map(opt=>opt.textContent) : [];
 const sections = slides.map(slide=>slide.querySelector('.diagnosis'));
 sections.forEach((section,i)=>{
   if(!section) return;
   const btn=document.createElement('button');
   btn.type='button'; btn.className='reveal-answer';
   btn.textContent='Revelar diagnóstico';
   btn.setAttribute('aria-label',`Revelar diagnóstico de la patología ${i+1}`);
   btn.addEventListener('click',()=>{
      const isRevealed=section.classList.toggle('is-revealed');
      btn.textContent=isRevealed?'Ocultar diagnóstico':'Revelar diagnóstico';
      btn.setAttribute('aria-label',`${isRevealed?'Ocultar':'Revelar'} diagnóstico de la patología ${i+1}`);
   });
   section.appendChild(btn);
 });
 const setChallenge = value => {
   document.body.classList.toggle('challenge-mode', value);
   if(toggle){
     toggle.setAttribute('aria-pressed',String(value));
     const label=toggle.querySelector('.study-label');
     if(label) label.textContent=value?'Modo desafío activo':'Modo desafío';
   }
   sections.forEach(section=>{
     section?.classList.remove('is-revealed');
     const btn=section?.querySelector('.reveal-answer');
     if(btn) btn.textContent='Revelar diagnóstico';
   });
   if(select){
     [...select.options].forEach((opt,i)=>{
       opt.textContent=value?`Lámina ${String(i+1).padStart(2,'0')} · Diagnóstico oculto`:originalLabels[i];
     });
   }
 };
 toggle?.addEventListener('click',()=>setChallenge(!document.body.classList.contains('challenge-mode')));
 // Progress follows the slideshow's existing counter, without changing its logic.
 const syncProgress=()=>{
   const value=select?.value;
   let index=slides.findIndex(s=>s.dataset.case===value);
   if(index<0 && counter){
     const m=(counter.textContent||'').match(/\d+/);
     if(m) index=Number(m[0])-1;
   }
   if(index>=0 && progress){
     progress.style.width=`${(index+1)/slides.length*100}%`;
     const box=progress.parentElement;
     box?.setAttribute('aria-valuenow',String(index+1));
     box?.setAttribute('aria-valuemax',String(slides.length));
   }
 };
 if(counter) new MutationObserver(syncProgress).observe(counter,{characterData:true,childList:true,subtree:true});
 select?.addEventListener('change',()=>requestAnimationFrame(syncProgress));
 window.addEventListener('hashchange',syncProgress);
 requestAnimationFrame(syncProgress);
})();
