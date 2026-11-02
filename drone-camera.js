(() => {
  const IMAGE = "/marvels-update-page/assets/file_0000000065dc821198c0855fcce200a3.png";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const style = document.createElement("style");
  style.textContent = `
    .city-fx,#cityCanvas{display:none!important}
    html,body{background:transparent!important}
    body{isolation:isolate}
    #drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden;pointer-events:none;perspective:1100px;background:#101522}
    #drone-scene img{position:absolute;inset:-7%;width:114%;height:114%;object-fit:cover;object-position:center 48%;will-change:transform;transform-origin:50% 48%;filter:saturate(1.04) contrast(1.02)}
    #appRoot{position:relative;z-index:1}
    #glitchFx{z-index:9999}
    @media(max-width:700px){#drone-scene img{inset:-10%;width:120%;height:120%;object-position:center}}
    @media(prefers-reduced-motion:reduce){#drone-scene img{transform:none!important}}
  `;
  document.head.appendChild(style);
  document.getElementById("drone-scene")?.remove();
  const scene=document.createElement("div");
  scene.id="drone-scene";
  scene.setAttribute("aria-hidden","true");
  const image=document.createElement("img");
  image.alt="";
  image.decoding="async";
  image.src=IMAGE;
  image.onerror=()=>{console.error("Marvel background image failed:",image.src);scene.style.background="#101522";};
  scene.appendChild(image);
  document.body.prepend(scene);
  let tx=0,ty=0,x=0,y=0,scroll=0;
  const small=()=>matchMedia("(max-width:700px)").matches;
  window.addEventListener("pointermove",e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;},{passive:true});
  const updateScroll=()=>{scroll=Math.min(1,(document.scrollingElement?.scrollTop||window.scrollY||0)/1800);};
  window.addEventListener("scroll",updateScroll,{passive:true});
  updateScroll();
  function frame(){
    x+=(tx-x)*.045;y+=(ty-y)*.045;
    const zoom=1.08+scroll*.32;
    image.style.transform=`translate3d(${x*(small()?10:24)}px,${y*(small()?7:15)+scroll*90}px,0) scale(${zoom}) rotateX(${-y*1.15}deg) rotateY(${x*1.4}deg)`;
    requestAnimationFrame(frame);
  }
  if(!reduced)requestAnimationFrame(frame);
})();