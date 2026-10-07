'use strict';

(() => {
  const slides=Array.from(document.querySelectorAll('.lesson-slide'));
  if(!slides.length)return;
  const positionKey='lfd121_reading_position';
  const previous=document.getElementById('readingPrev');
  const next=document.getElementById('readingNext');
  const moduleSelect=document.getElementById('readingModule');
  const counter=document.getElementById('readingCounter');
  const position=document.getElementById('readingPosition');
  const progress=document.getElementById('readingProgress');
  const progressBar=document.getElementById('readingProgressBar');
  const moduleLinks=Array.from(document.querySelectorAll('.docs-nav a[data-module]'));
  let current=0;

  function storedPosition(){
    try {
      const saved=Number(localStorage.getItem(positionKey));
      return Number.isInteger(saved) && saved>=0 && saved<slides.length?saved:0;
    } catch(error) { return 0; }
  }

  function positionFromHash(hash){
    const concept=/^#concepto-(\d+)$/.exec(hash);
    if(concept){
      const index=Number(concept[1])-1;
      return index>=0 && index<slides.length?index:null;
    }
    const module=/^#modulo-(\d+)$/.exec(hash);
    if(module){
      const index=slides.findIndex(slide=>Number(slide.dataset.module)===Number(module[1])-1);
      return index>=0?index:null;
    }
    return null;
  }

  function showSlide(index,{focus=false,updateHash=true}={}){
    current=Math.max(0,Math.min(slides.length-1,index));
    slides.forEach((slide,number)=>{slide.hidden=number!==current;});
    const active=slides[current];
    active.querySelectorAll('details').forEach(detail=>{detail.open=false;});
    moduleSelect.value=active.dataset.module;
    counter.textContent='Diapositiva '+(current+1)+' de '+slides.length;
    position.textContent=(current+1)+' / '+slides.length;
    previous.disabled=current===0;
    next.textContent=current===slides.length-1?'Ir a la prueba →':'Siguiente →';
    progress.setAttribute('aria-valuenow',String(current+1));
    progress.setAttribute('aria-valuetext',counter.textContent);
    progressBar.style.width=((current+1)/slides.length*100)+'%';
    moduleLinks.forEach(link=>{
      if(link.dataset.module===active.dataset.module)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    try { localStorage.setItem(positionKey,String(current)); }
    catch(error) { /* La navegación funciona aunque no pueda guardarse. */ }
    if(updateHash){
      try { history.replaceState(null,'','#'+active.id); }
      catch(error) { /* Guardar la posición no requiere modificar la URL. */ }
    }
    if(focus){
      active.querySelector('h2').focus({preventScroll:true});
      document.getElementById('readingStage').scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  }

  function openReference(hash){
    if(hash!=='#como-estudiar')return;
    const reference=document.getElementById(hash.slice(1));
    reference.open=true;
    reference.scrollIntoView({behavior:'smooth',block:'start'});
  }

  previous.addEventListener('click',()=>showSlide(current-1,{focus:true}));
  next.addEventListener('click',()=>{
    if(current===slides.length-1){
      location.href='index.html#practicePanel';
      return;
    }
    showSlide(current+1,{focus:true});
  });
  moduleSelect.addEventListener('change',()=>{
    const index=slides.findIndex(slide=>slide.dataset.module===moduleSelect.value);
    if(index>=0)showSlide(index,{focus:true});
  });
  moduleLinks.forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    const index=positionFromHash(link.getAttribute('href'));
    if(index!==null)showSlide(index,{focus:true});
  }));
  document.querySelectorAll('a[href="#como-estudiar"]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    event.preventDefault();
    const hash=link.getAttribute('href');
    try { history.replaceState(null,'',hash); } catch(error) { /* Referencia local. */ }
    openReference(hash);
  }));
  window.addEventListener('hashchange',()=>{
    const index=positionFromHash(location.hash);
    if(index!==null)showSlide(index,{focus:true,updateHash:false});
    else openReference(location.hash);
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented)return;
    if(event.target.closest('input,select,textarea,[contenteditable]'))return;
    if(event.key==='ArrowRight' && current<slides.length-1){
      event.preventDefault();
      showSlide(current+1,{focus:true});
    } else if(event.key==='ArrowLeft' && current>0){
      event.preventDefault();
      showSlide(current-1,{focus:true});
    }
  });

  const requested=positionFromHash(location.hash);
  showSlide(requested===null?storedPosition():requested,{updateHash:!location.hash});
  openReference(location.hash);
})();
