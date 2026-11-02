(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = document.getElementById("drone-scene");
  const image = scene?.querySelector("img");
  if (!scene || !image) {
    console.error("Drone camera: background scene or PNG image is missing.");
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .city-fx,#cityCanvas{display:none!important}
    html,body{background:transparent!important}
    body{isolation:isolate}
    #drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;perspective:900px;background:#101522}
    #drone-scene img{position:absolute;inset:-12%;width:124%;height:124%;max-width:none;object-fit:cover;object-position:center 48%;transform-origin:50% 52%;will-change:transform;backface-visibility:hidden;filter:saturate(1.06) contrast(1.035)}
    #appRoot{position:relative;z-index:1}
    #glitchFx{z-index:9999}
    @media(max-width:700px){#drone-scene img{inset:-16%;width:132%;height:132%;object-position:center 50%}}
    @media(prefers-reduced-motion:reduce){#drone-scene img{transform:none!important}}
  `;
  document.head.appendChild(style);

  let targetX=0,targetY=0,lookX=0,lookY=0,travel=0;
  let lastWheel=0;
  const isSmall=()=>matchMedia("(max-width:700px)").matches;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // Mouse / touch position steers the virtual camera like a drone gimbal.
  window.addEventListener("pointermove",e=>{
    targetX=clamp((e.clientX/innerWidth-.5)*2,-1,1);
    targetY=clamp((e.clientY/innerHeight-.5)*2,-1,1);
  },{passive:true});
  window.addEventListener("pointerleave",()=>{targetX=0;targetY=0;},{passive:true});

  // Wheel input adds forward flight even when the archive uses an inner scroll area.
  window.addEventListener("wheel",e=>{
    travel=clamp(travel+e.deltaY/2600,0,1);
    lastWheel=performance.now();
  },{passive:true});
  window.addEventListener("scroll",()=>{
    const root=document.scrollingElement;
    if(root && root.scrollHeight>innerHeight+20){
      const page=clamp(root.scrollTop/(root.scrollHeight-innerHeight),0,1);
      travel=Math.max(travel,page);
    }
  },{passive:true});

  // Touch swipes steer and gently advance the camera on phones.
  let touchX=0,touchY=0;
  window.addEventListener("touchstart",e=>{
    if(e.touches.length){touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;}
  },{passive:true});
  window.addEventListener("touchmove",e=>{
    if(!e.touches.length)return;
    const t=e.touches[0];
    targetX=clamp((t.clientX/innerWidth-.5)*2,-1,1);
    targetY=clamp((t.clientY/innerHeight-.5)*2,-1,1);
    const dy=touchY-t.clientY;
    if(Math.abs(dy)>2){travel=clamp(travel+dy/innerHeight*.055,0,1);touchY=t.clientY;}
    touchX=t.clientX;
  },{passive:true});

  const start=performance.now();
  function animate(now){
    const t=(now-start)/1000;
    lookX+=(targetX-lookX)*.055;
    lookY+=(targetY-lookY)*.055;

    // Slow hovering drift plus a forward push controlled by scroll/swipe.
    const idleX=Math.sin(t*.22)*.16;
    const idleY=Math.sin(t*.31)*.10;
    const x=lookX*.72+idleX;
    const y=lookY*.55+idleY;
    const zoom=1.10+travel*.48+Math.sin(t*.18)*.012;
    const px=isSmall()?15:34;
    const py=isSmall()?12:24;
    const driftDown=travel*(isSmall()?46:72);

    image.style.transform=
      `translate3d(${-x*px}px,${-y*py+driftDown}px,0) `+
      `scale(${zoom}) rotateX(${-y*2.1}deg) rotateY(${x*3.0}deg)`;

    scene.style.setProperty("--camera-travel",travel.toFixed(3));
    requestAnimationFrame(animate);
  }

  if(!reduceMotion) requestAnimationFrame(animate);
  else image.style.transform="scale(1.1)";
})();