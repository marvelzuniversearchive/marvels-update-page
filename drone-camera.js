(() => {
  const scene = document.getElementById("drone-scene");
  const image = scene?.querySelector("img");
  if (!scene || !image) {
    console.error("Background scene: scene/image missing");
    return;
  }

  image.src = "https://yenigellagnandeep-commits.github.io/marvels-update-page/assets/file_0000000065dc821198c0855fcce200a3.png";
  image.alt = "Anime-inspired distant city skyline surrounding a central lake";

  const style = document.createElement("style");
  style.textContent = [
    ".city-fx,#cityCanvas{display:none!important}",
    "html,body{background:transparent!important}body{isolation:isolate}",
    "#drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:#101522;contain:paint}",
    /* Fixed framing: the artwork never zooms, pans, or follows the pointer. */
    "#drone-scene img{position:absolute;inset:-18%;width:136%;height:136%;max-width:none;object-fit:cover;object-position:center 48%;transform:none!important;animation:none!important;will-change:auto;backface-visibility:hidden;filter:saturate(1.07) contrast(1.04)}",
    /* Slow cloud-shadow drift stays within the sky overlay. */
    "#drone-scene .ambient-sky{position:absolute;z-index:1;inset:-8% -22% 48%;opacity:.20;filter:blur(18px);background:radial-gradient(ellipse 19% 25% at 12% 48%,rgba(255,238,226,.56),transparent 72%),radial-gradient(ellipse 24% 30% at 43% 34%,rgba(255,228,218,.48),transparent 74%),radial-gradient(ellipse 20% 24% at 76% 50%,rgba(255,239,225,.42),transparent 72%),radial-gradient(ellipse 15% 22% at 94% 25%,rgba(255,223,211,.34),transparent 75%);animation:skyCloudDrift 115s linear infinite alternate}",
    /* Subtle water reflections move only in the lower lake overlay. */
    "#drone-scene .ambient-water{position:absolute;z-index:2;left:0;right:0;top:58%;bottom:0;opacity:.22;background:repeating-linear-gradient(0deg,transparent 0 9px,rgba(255,232,214,.20) 10px,transparent 11px 17px);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.25) 18%,#000 58%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.25) 18%,#000 58%,transparent 100%);background-size:100% 46px;animation:lakeSurface 17s ease-in-out infinite alternate}",
    "#appRoot{position:relative;z-index:3}#glitchFx{z-index:9999}",
    "@keyframes skyCloudDrift{from{transform:translate3d(-2.5%,0,0)}to{transform:translate3d(2.5%,1.2%,0)}}",
    "@keyframes lakeSurface{from{background-position:0 0;opacity:.13}to{background-position:0 46px;opacity:.24}}",
    "@media(max-width:700px){#drone-scene img{inset:-23%;width:146%;height:146%;object-position:center 50%}#drone-scene .ambient-sky{inset:-6% -30% 52%;opacity:.16}#drone-scene .ambient-water{top:60%;opacity:.16}}",
    "@media(prefers-reduced-motion:reduce){#drone-scene .ambient-sky,#drone-scene .ambient-water{animation:none!important}}"
  ].join("");
  document.head.appendChild(style);

  // Environmental overlays animate independently; the camera and artwork remain locked.
  const sky = document.createElement("div");
  sky.className = "ambient-sky";
  sky.setAttribute("aria-hidden", "true");
  const water = document.createElement("div");
  water.className = "ambient-water";
  water.setAttribute("aria-hidden", "true");
  scene.append(sky, water);
})();
