(() => {
  const IMAGE = "assets/file_0000000065dc821198c0855fcce200a3.png";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const style = document.createElement("style");
  style.textContent = `
    #cityCanvas{opacity:0!important;pointer-events:none!important}
    #drone-scene{position:fixed;inset:0;z-index:-2;overflow:hidden;pointer-events:none;perspective:1100px;background:#0a1420}
    #drone-scene .drone-image{position:absolute;inset:-7%;background-image:linear-gradient(180deg,rgba(5,12,24,.05),rgba(5,12,24,.28)),url("${IMAGE}");background-size:cover;background-position:center 48%;background-repeat:no-repeat;will-change:transform;transform-origin:50% 48%;filter:saturate(1.06) contrast(1.02)}
    #drone-scene:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,20,.03),transparent 45%,rgba(5,10,20,.2));}
    body{background:transparent!important}
    @media(max-width:700px){#drone-scene .drone-image{background-position:center;inset:-10%}}
    @media(prefers-reduced-motion:reduce){#drone-scene .drone-image{transform:none!important}}
  `;
  document.head.appendChild(style);
  const scene = document.createElement("div");
  scene.id = "drone-scene";
  scene.setAttribute("aria-hidden","true");
  const image = document.createElement("div");
  image.className = "drone-image";
  scene.appendChild(image);
  document.body.prepend(scene);
  let tx=0,ty=0,x=0,y=0,scroll=0,raf=0;
  const small=()=>matchMedia("(max-width:700px)").matches;
  window.addEventListener("pointermove",e=>{
    tx=(e.clientX/innerWidth-.5)*2;
    ty=(e.clientY/innerHeight-.5)*2;
  },{passive:true});
  window.addEventListener("scroll",()=>{scroll=Math.min(1,window.scrollY/1800)},{passive:true});
  function frame(){
    raf=0;
    if(!reduced){
      x+=(tx-x)*.045;y+=(ty-y)*.045;
      const zoom=1.08+scroll*.32;
      const dx=x*(small()?10:24);
      const dy=y*(small()?7:15)+scroll*90;
      image.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${zoom}) rotateX(${-y*1.15}deg) rotateY(${x*1.4}deg)`;
    }
    raf=requestAnimationFrame(frame);
  }
  if(!reduced) frame();
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else if(!document.hidden&&!reduced&&!raf)frame()});
})();