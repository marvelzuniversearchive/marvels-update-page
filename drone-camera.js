(() => {
  "use strict";

  const scene = document.getElementById("drone-scene");
  const image = scene?.querySelector("img");
  const canvas = document.getElementById("cityCanvas");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (!scene || !image || !canvas || !ctx) {
    console.error("Living city background: required scene elements are missing");
    return;
  }

  // Preserve the existing city-and-lake artwork and lock the camera completely.
  image.src = "https://yenigellagnandeep-commits.github.io/marvels-update-page/assets/file_0000000065dc821198c0855fcce200a3.png";
  image.alt = "Distant anime-style city surrounding a central lake";
  image.style.cssText = "position:absolute;inset:-18%;width:136%;height:136%;max-width:none;object-fit:cover;object-position:center 48%;transform:none!important;animation:none!important;will-change:auto;backface-visibility:hidden;filter:saturate(1.045) contrast(1.025)";
  
  const style = document.createElement("style");
  style.textContent = `
    #drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:#101522!important;contain:paint}
    #drone-scene img{position:absolute!important;inset:-18%!important;width:136%!important;height:136%!important;max-width:none!important;object-fit:cover!important;object-position:center 48%!important;transform:none!important;animation:none!important;transition:none!important;will-change:auto!important}
    .city-fx{display:block!important;position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;overflow:hidden!important}
    #cityCanvas{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:1!important;pointer-events:none!important}
    #appRoot{position:relative;z-index:3}
    #glitchFx{z-index:9999}
    @media(max-width:700px){#drone-scene img{inset:-23%!important;width:146%!important;height:146%!important;object-position:center 50%!important}}
    @media(prefers-reduced-motion:reduce){#cityCanvas{opacity:.45!important}}
  `;
  document.head.appendChild(style);

  let width = 0, height = 0, dpr = 1, raf = 0, last = 0, elapsed = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cloudGroups = [
    { x: .08, y: .17, scale: 1.00, speed: .00072, alpha: .105 },
    { x: .48, y: .105, scale: .72, speed: .00048, alpha: .075 },
    { x: .83, y: .23, scale: .90, speed: .00061, alpha: .085 },
    { x: .25, y: .34, scale: .58, speed: .00036, alpha: .055 }
  ];

  function resize() {
    const rect = scene.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(elapsed);
  }

  function cloud(x, y, size, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, size * .05, x, y, size);
    g.addColorStop(0, "rgba(255,239,226,.42)");
    g.addColorStop(.42, "rgba(224,232,246,.22)");
    g.addColorStop(1, "rgba(220,230,245,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.55, size * .42, -.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawClouds(t) {
    const skyBottom = height * .455;
    for (const c of cloudGroups) {
      const span = width + width * .65;
      const x = ((c.x * width + t * c.speed * width * .18) % span) - width * .28;
      const y = c.y * height + Math.sin(t * .00012 + c.x * 9) * height * .004;
      const s = Math.max(75, width * .19 * c.scale);
      cloud(x, y, s, c.alpha);
      cloud(x + s * .66, y + s * .035, s * .7, c.alpha * .68);
      cloud(x - s * .72, y + s * .02, s * .62, c.alpha * .62);
    }

    // A very restrained atmospheric veil; it never moves the underlying artwork.
    const haze = ctx.createLinearGradient(0, 0, 0, skyBottom);
    haze.addColorStop(0, "rgba(255,228,214,.018)");
    haze.addColorStop(.7, "rgba(225,231,243,.028)");
    haze.addColorStop(1, "rgba(225,231,243,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, skyBottom);
  }

  function drawWater(t) {
    const top = height * .585;
    const bottom = height;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, width, bottom - top);
    ctx.clip();

    // Soft moving reflection, kept low-contrast so the lake artwork remains visible.
    const shimmerX = width * (.52 + Math.sin(t * .00009) * .09);
    const reflection = ctx.createRadialGradient(shimmerX, top + (bottom-top)*.34, 2, shimmerX, top + (bottom-top)*.34, width*.42);
    reflection.addColorStop(0, "rgba(255,228,201,.075)");
    reflection.addColorStop(.48, "rgba(224,232,246,.028)");
    reflection.addColorStop(1, "rgba(224,232,246,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = reflection;
    ctx.fillRect(0, top, width, bottom-top);

    // Fine, irregular wavelets drift sideways rather than sliding the scene.
    for (let band = 0; band < 22; band++) {
      const y = top + (bottom-top) * (.12 + band * .038);
      const amplitude = 1.0 + (band % 4) * .42;
      const phase = t * (.00042 + (band % 5) * .000035) + band * 1.73;
      const lineWidth = width * (.035 + ((band * 7) % 13) / 100);
      const travel = ((t * (.006 + (band % 4) * .0018) + band * 53) % (width + lineWidth * 2)) - lineWidth;
      ctx.beginPath();
      for (let p = 0; p <= 18; p++) {
        const px = travel + p * (lineWidth / 18);
        const py = y + Math.sin(p * .72 + phase) * amplitude + Math.sin(p * .23 + phase * .7) * .55;
        if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = band % 3 === 0 ? "rgba(255,235,218,.105)" : "rgba(220,232,247,.07)";
      ctx.lineWidth = band % 4 === 0 ? 1.25 : .8;
      ctx.stroke();
    }

    const depth = ctx.createLinearGradient(0, top, 0, bottom);
    depth.addColorStop(0, "rgba(255,239,224,0)");
    depth.addColorStop(.55, "rgba(16,28,45,.012)");
    depth.addColorStop(1, "rgba(12,20,34,.045)");
    ctx.fillStyle = depth;
    ctx.fillRect(0, top, width, bottom-top);
    ctx.restore();
  }

  function draw(t) {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    drawClouds(t);
    drawWater(t);
  }

  function frame(now) {
    if (document.hidden) { raf = 0; return; }
    const delta = last ? Math.min(48, now - last) : 16;
    last = now;
    elapsed += delta;
    draw(elapsed);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion || raf || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(scene);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  resize();
  if (!reduceMotion) start();
})();
