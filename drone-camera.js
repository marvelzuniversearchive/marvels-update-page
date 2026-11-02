(() => {
  const scene = document.getElementById("drone-scene");
  const image = scene?.querySelector("img");
  if (!scene || !image) { console.error("Drone camera: scene/image missing"); return; }

  const style = document.createElement("style");
  style.textContent = `
    .city-fx,#cityCanvas{display:none!important}
    html,body{background:transparent!important}
    body{isolation:isolate}
    #drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:#101522}
    #drone-scene img{position:absolute;inset:-18%;width:136%;height:136%;max-width:none;object-fit:cover;object-position:center 48%;transform-origin:50% 50%;will-change:transform;backface-visibility:hidden;filter:saturate(1.07) contrast(1.04)}
    #appRoot{position:relative;z-index:1}
    #glitchFx{z-index:9999}
    @media(max-width:700px){#drone-scene img{inset:-23%;width:146%;height:146%;object-position:center 50%}}
  `;
  document.head.appendChild(style);

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const small=()=>matchMedia("(max-width:700px)").matches;
  let steerX=0,steerY=0,lookX=0,lookY=0;
  let forward=0,side=0,altitude=0,lastTouchY=0;

  window.addEventListener("pointermove",e=>{
    steerX=clamp((e.clientX/innerWidth-.5)*2,-1,1);
    steerY=clamp((e.clientY/innerHeight-.5)*2,-1,1);
  },{passive:true});
  window.addEventListener("pointerleave",()=>{steerX=0;steerY=0;},{passive:true});

  window.addEventListener("wheel",e=>{
    const amount=clamp(e.deltaY/900,-1,1);
    forward=clamp(forward+amount*.105,0,1);
    side=clamp(side+e.deltaX/1200,-.65,.65);
    altitude=clamp(altitude+amount*.035,-.35,.35);
  },{passive:true});

  window.addEventListener("scroll",()=>{
    const root=document.scrollingElement;
    if(root && root.scrollHeight>innerHeight+20){
      const p=clamp(root.scrollTop/(root.scrollHeight-innerHeight),0,1);
      forward=Math.max(forward,p*.82);
    }
  },{passive:true});

  window.addEventListener("touchstart",e=>{
    if(e.touches.length)lastTouchY=e.touches[0].clientY;
  },{passive:true});
  window.addEventListener("touchmove",e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    steerX=clamp((t.clientX/innerWidth-.5)*2,-1,1);
    steerY=clamp((t.clientY/innerHeight-.5)*2,-1,1);
    const dy=lastTouchY-t.clientY;
    forward=clamp(forward+dy/innerHeight*.16,0,1);
    altitude=clamp(altitude+dy/innerHeight*.045,-.35,.35);
    lastTouchY=t.clientY;
  },{passive:true});

  const start=performance.now();
  function animate(now){
    const t=(now-start)/1000;
    lookX+=(steerX-lookX)*.045;
    lookY+=(steerY-lookY)*.045;
    const cruiseX=Math.sin(t*.19)*.42+Math.sin(t*.071)*.16;
    const cruiseY=Math.sin(t*.13)*.20+Math.sin(t*.047)*.10;
    const x=clamp(cruiseX+lookX*.58+side,-1.2,1.2);
    const y=clamp(cruiseY+lookY*.42+altitude,-.8,.8);
    const depth=1.035+forward*.31+Math.sin(t*.11)*.012;
    const driftX=-x*(small()?58:112);
    const driftY=-y*(small()?43:76)+forward*(small()?62:104);
    image.style.transform=`translate3d(${driftX}px,${driftY}px,0) scale(${depth})`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();