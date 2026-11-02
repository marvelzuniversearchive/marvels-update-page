(() => {
  const root = document.getElementById("drone-scene");
  if (!root || root.dataset.world3d === "ready") return;
  root.dataset.world3d = "loading";

  const style = document.createElement("style");
  style.textContent = `
    #drone-scene{position:fixed!important;inset:0!important;z-index:0!important;overflow:hidden!important;pointer-events:none!important;background:linear-gradient(#70b9e8 0%,#c5e4f3 52%,#e7f0ee 100%)!important}
    #drone-scene>img{display:none!important}
    #drone-scene canvas#cityWorld3D{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:2!important}
    #appRoot{position:relative;z-index:3}
    #glitchFx{z-index:9999}
  `;
  document.head.appendChild(style);

  const boot = async () => {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x91c9ed);
    scene.fog = new THREE.Fog(0x9fcde8, 75, 190);

    const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 260);
    camera.position.set(0, 10, 34);
    const baseTarget = new THREE.Vector3(0, 7, -24);
    camera.lookAt(baseTarget);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.domElement.id = "cityWorld3D";
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    root.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe8f7ff, 0x526578, 2.0));
    const sun = new THREE.DirectionalLight(0xfff1d7, 2.4);
    sun.position.set(-35, 55, 28);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9ad9ff, 1.05);
    fill.position.set(35, 20, -30);
    scene.add(fill);

    const mat = (color, roughness=.72, metalness=.08) => new THREE.MeshStandardMaterial({color, roughness, metalness});
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 180), mat(0x4c7469));
    ground.rotation.x = -Math.PI/2; ground.position.set(0,-.35,-45); scene.add(ground);

    // Distant layered mountain silhouettes keep the same mountain horizon as the reference.
    function mountainLayer(z, y, color, seed, scale) {
      let pts = [new THREE.Vector2(-120, -8)];
      let x = -120;
      let n = seed;
      while (x < 120) {
        n = (n * 9301 + 49297) % 233280;
        const h = 8 + (n / 233280) * scale;
        pts.push(new THREE.Vector2(x, h));
        x += 5 + (n % 7);
      }
      pts.push(new THREE.Vector2(120,-8));
      const shape = new THREE.Shape(pts);
      const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat(color,1,0));
      mesh.position.set(0,y,z);
      scene.add(mesh);
    }
    mountainLayer(-68, 1, 0x668d9c, 18, 13);
    mountainLayer(-62, 0, 0x829eaa, 43, 10);
    mountainLayer(-57, -.4, 0xa5b8ba, 81, 7);

    // Central lake: a wide, animated water surface with subtle moving wave highlights.
    const waterGeo = new THREE.PlaneGeometry(60, 92, 120, 80);
    const waterMat = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uColor:{value:new THREE.Color(0x347f9c)} },
      vertexShader: `
        uniform float uTime; varying vec2 vUv; varying float vWave;
        void main(){
          vUv=uv;
          vec3 p=position;
          float w=sin(p.x*.19+uTime*.65)*.12+cos(p.y*.31-uTime*.8)*.10+sin((p.x+p.y)*.12+uTime*.42)*.08;
          p.z += w; vWave=w;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; varying vec2 vUv; varying float vWave;
        void main(){
          float bands=sin(vUv.y*440.0+sin(vUv.x*24.0+uTime)*2.0+uTime*1.4);
          float glint=smoothstep(.84,.99,bands)*.19;
          float shimmer=sin(vUv.x*170.0+vUv.y*90.0+uTime*1.7)*.025;
          vec3 c=uColor+vec3(glint+shimmer,glint*.9+shimmer,glint*.8+shimmer);
          c=mix(c,vec3(.58,.78,.82),smoothstep(.72,1.0,vUv.y)*.18);
          gl_FragColor=vec4(c,1.0);
        }`
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x=-Math.PI/2; water.position.set(0,.04,-22); scene.add(water);

    // Shore edges frame the water without blocking the center.
    const shoreMat=mat(0x667e72);
    for (const side of [-1,1]) {
      const bank=new THREE.Mesh(new THREE.BoxGeometry(18,.45,72),shoreMat);
      bank.position.set(side*40,-.05,-20); scene.add(bank);
    }

    // Distinct buildings: individual masses, roof silhouettes, facade grids and window details.
    const facadeColors=[0x526b7c,0x6f8795,0x344b61,0x8b9da4,0x4b6272,0x9aa9aa,0x3e5368];
    const windowMats=[mat(0x9ed7e8,.34,.25),mat(0x344d62,.28,.28),mat(0xd4c9a2,.4,.12)];
    function building(x,z,w,h,d,index,front=true){
      const group=new THREE.Group(); group.position.set(x,0,z); scene.add(group);
      const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(facadeColors[index%facadeColors.length],.55,.18));
      body.position.y=h/2; group.add(body);
      const roofY=h+.06;
      if(index%4===0){const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.72,.8,d*.72),mat(0x334b60));cap.position.y=roofY+.35;group.add(cap);}
      if(index%5===1){const spire=new THREE.Mesh(new THREE.CylinderGeometry(.06,.18,h*.18,6),mat(0x394f5d));spire.position.set(0,h+h*.09,0);group.add(spire);}
      if(index%3===0){const crown=new THREE.Mesh(new THREE.BoxGeometry(w*.42,1.1,d*.45),mat(0x9aabb0));crown.position.y=h+.5;group.add(crown);}
      const cols=Math.max(2,Math.floor(w/1.05)), rows=Math.max(3,Math.floor(h/1.35));
      const winGeo=new THREE.PlaneGeometry(Math.max(.18,w/(cols*2.4)),Math.max(.22,h/(rows*2.6)));
      const frontZ=d/2+.012;
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const win=new THREE.Mesh(winGeo,windowMats[(r+c+index)%windowMats.length]);
        win.position.set(-w/2+(c+.5)*w/cols,h*.12+(r+.5)*(h*.78/rows),frontZ);
        group.add(win);
      }
      // Thin horizontal floor bands make each facade legible at a distance.
      const bandMat=mat(0x263b4b,.65,.1);
      for(let r=1;r<rows;r+=3){
        const band=new THREE.Mesh(new THREE.BoxGeometry(w*1.01,.055,d*1.01),bandMat);
        band.position.y=h*.12+r*(h*.78/rows);group.add(band);
      }
      return group;
    }

    // Foreground towers sit on both sides, leaving a clear central lake corridor.
    const foreground=[
      [-34,5,8,25,7,0],[-43,-1,7,19,6,1],[-53,-7,8,29,7,2],[-37,-13,6,16,5,3],
      [34,4,8,23,7,4],[43,-2,7,28,6,5],[53,-8,8,18,7,0],[37,-14,6,20,5,2],
      [-62,3,7,16,7,4],[62,1,7,21,6,1]
    ];
    foreground.forEach(a=>building(...a));
    // A separate, lower skyline across the far shore, with recognizable varied rooflines.
    const skyline=[
      [-25,-34,5,11,4,1],[-19,-35,6,17,5,3],[-12,-36,5,13,4,0],[-6,-37,7,21,5,4],
      [2,-37,5,14,4,2],[9,-36,6,19,5,5],[16,-35,5,12,4,1],[23,-34,7,16,5,6],
      [-34,-32,5,9,4,2],[31,-33,5,10,4,3],[0,-30,4,8,4,0]
    ];
    skyline.forEach(a=>building(...a));

    // Clouds are built from soft clusters and drift continuously at different depths/speeds.
    const cloudMat=new THREE.MeshStandardMaterial({color:0xf5fbff,roughness:1,transparent:true,opacity:.88});
    const cloudGroups=[];
    function cloud(x,y,z,speed,scale){
      const g=new THREE.Group(); g.position.set(x,y,z); g.userData.speed=speed; scene.add(g);
      const lumps=[[-1.5,0,0,1.15],[0,.35,0,1.45],[1.45,.08,0,1.05],[.2,-.18,.25,1.25],[-.45,.48,-.12,.9]];
      lumps.forEach(([cx,cy,cz,r])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r*scale,12,9),cloudMat);m.position.set(cx*scale,cy*scale,cz*scale);g.add(m);});
      cloudGroups.push(g);
    }
    cloud(-35,29,-48,.85,3.4); cloud(4,34,-55,.48,4.3); cloud(38,27,-44,.72,3.1);
    cloud(-55,22,-29,1.2,2.2); cloud(55,25,-34,.95,2.5); cloud(18,20,-22,.38,1.65);

    // Small shoreline trees add scale and help separate the lake from the skyline.
    const trunkMat=mat(0x594e40), leafMat=mat(0x476d5c);
    for(let side of [-1,1]) for(let i=0;i<18;i++){
      const x=side*(34+i*1.55), z=-13-(i%4)*3.2;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.7,5),trunkMat);trunk.position.set(x,.85,z);scene.add(trunk);
      const crown=new THREE.Mesh(new THREE.SphereGeometry(.85+(i%3)*.16,8,7),leafMat);crown.position.set(x,2,z);scene.add(crown);
    }

    let pointerX=0,pointerY=0,aimX=0,aimY=0,travel=0,sideDrift=0;
    addEventListener("pointermove",e=>{pointerX=(e.clientX/innerWidth-.5)*2;pointerY=(e.clientY/innerHeight-.5)*2;},{passive:true});
    addEventListener("pointerleave",()=>{pointerX=0;pointerY=0;},{passive:true});
    addEventListener("wheel",e=>{travel=THREE.MathUtils.clamp(travel+e.deltaY*.001,0,1);sideDrift=THREE.MathUtils.clamp(sideDrift+e.deltaX*.001,-.5,.5);},{passive:true});
    let touchY=0;
    addEventListener("touchstart",e=>{if(e.touches[0])touchY=e.touches[0].clientY;},{passive:true});
    addEventListener("touchmove",e=>{if(!e.touches[0])return;const dy=touchY-e.touches[0].clientY;travel=THREE.MathUtils.clamp(travel+dy/innerHeight*.18,0,1);touchY=e.touches[0].clientY;},{passive:true});
    const clock=new THREE.Clock();
    function animate(){
      const t=clock.getElapsedTime();
      waterMat.uniforms.uTime.value=t;
      cloudGroups.forEach(g=>{g.position.x+=g.userData.speed*.0035;if(g.position.x>95)g.position.x=-95;});
      aimX+=(pointerX-aimX)*.025; aimY+=(pointerY-aimY)*.025;
      const mobile=innerWidth<700;
      const target=new THREE.Vector3(aimX*(mobile?5:9)+sideDrift*8,7.5-aimY*2.2,-24-travel*9);
      camera.position.x+=(Math.sin(t*.11)*1.7+target.x-camera.position.x)*.012;
      camera.position.y+=(10+Math.sin(t*.16)*.38-aimY*.9-camera.position.y)*.012;
      camera.position.z+=(34-travel*5-camera.position.z)*.012;
      camera.lookAt(target);
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    animate();

    addEventListener("resize",()=>{
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight);
    },{passive:true});
    root.dataset.world3d="ready";
  };

  boot().catch(err=>{
    root.dataset.world3d="failed";
    console.error("3D city scene failed to load; retaining original city image.",err);
    const fallback=root.querySelector("img"); if(fallback) fallback.style.display="block";
  });
})();