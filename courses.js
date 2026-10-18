/* courses.js - rotating course wheel + smooth height + auto-play (stops once the user clicks) */
(function(){
  var root=document.getElementById('crsTabs');
  if(!root) return;
  var dial=root.querySelector('#cwDial');
  var orbit=root.querySelector('#cwOrbit');
  var stage=root.querySelector('#cwStage');
  var cap=root.querySelector('#cwCap');
  var capNo=root.querySelector('#cwNo');
  var capName=root.querySelector('#cwName');
  var nodes=[].slice.call(root.querySelectorAll('.cw-node'));
  var panels=[].slice.call(root.querySelectorAll('.cw-panel'));
  var bgs=[].slice.call(root.querySelectorAll('.cw-bg'));
  var faces=[].slice.call(root.querySelectorAll('.cw-face'));
  var N=nodes.length, STEP=360/N;
  var DUR=6000, cur=0, ang=0, timer=null, hTimer=null, visible=false, hover=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var auto=!reduce;
  dial.style.setProperty('--dur',DUR+'ms');

  /* rotate the wheel so the chosen node sits at the top (shortest way round) */
  function rotateTo(i){
    var target=-i*STEP;
    var diff=((target-ang)%360+540)%360-180;
    ang+=diff;
    orbit.style.transform='rotate('+ang+'deg)';
    nodes.forEach(function(n,k){
      n.querySelector('.cw-rot').style.transform='rotate('+(-(k*STEP)-ang)+'deg)';
    });
  }

  function schedule(){
    clearTimeout(timer);
    dial.classList.remove('run');
    if(!auto||!visible||hover) return;
    void dial.offsetWidth;                   /* restart progress arc */
    dial.classList.add('run');
    timer=setTimeout(function(){ show((cur+1)%N,false); },DUR);
  }

  function show(i,user){
    if(i===cur && panels[i].classList.contains('active')){ if(user) auto=false; schedule(); return; }

    var h0=stage.offsetHeight;               /* smooth height change */
    stage.style.height='';
    cur=i;
    nodes.forEach(function(n,k){
      var on=k===i;
      n.classList.toggle('active',on);
      n.setAttribute('aria-selected',on);
      n.tabIndex=on?0:-1;
      panels[k].classList.toggle('active',on);
      bgs[k].classList.toggle('active',on);
      faces[k].classList.toggle('active',on);
    });
    var h1=stage.offsetHeight;
    if(!reduce && h0 && h0!==h1){
      stage.style.height=h0+'px';
      void stage.offsetHeight;
      stage.style.height=h1+'px';
      clearTimeout(hTimer);
      hTimer=setTimeout(function(){ stage.style.height=''; },650);
    }

    rotateTo(i);
    capNo.textContent='COURSE '+String.fromCharCode(65+i);
    capName.textContent=nodes[i].getAttribute('data-t');
    cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap');

    if(user) auto=false;
    schedule();
  }

  nodes.forEach(function(n,i){
    n.addEventListener('click',function(){ show(i,true); });
    n.addEventListener('keydown',function(e){
      var k=e.key,t=-1;
      if(k==='ArrowRight'||k==='ArrowDown') t=(i+1)%N;
      else if(k==='ArrowLeft'||k==='ArrowUp') t=(i-1+N)%N;
      else if(k==='Home') t=0;
      else if(k==='End') t=N-1;
      if(t>-1){ e.preventDefault(); show(t,true); nodes[t].focus(); }
    });
  });

  root.addEventListener('mouseenter',function(){ hover=true; schedule(); });
  root.addEventListener('mouseleave',function(){ hover=false; schedule(); });

  rotateTo(0);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      visible=es[0].isIntersecting; schedule();
    },{threshold:.35}).observe(root);
  }
})();
