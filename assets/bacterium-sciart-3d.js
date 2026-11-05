
/*
 * SCI-ART BACTERIUM — LUMINOUS V3, 2026-11-05.
 * True volumetric Three.js object, continuous 360-degree rotation.
 * More intense turquoise membranes, blue nucleoid, gold plasmids,
 * fine surface streaks and softly luminous flagella.
 * Fully transparent WebGL canvas for a frame-free dark-blue hero.
 * Drop-in replacement: assets/bacterium-sciart-3d.js
 */

const mount = document.querySelector('[data-bacterium-3d]');

if (mount) {
  import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js')
    .then((THREE) => initialise3D(THREE, mount))
    .catch((error) => {
      console.warn('3D renderer unavailable; using fallback.', error);
      mount.classList.add('bacterium-fallback-only');
    });
}

function initialise3D(THREE, mount) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.05;
  // Filmic luminosity/glow. The CSS filter follows the actual transparent 3D
  // silhouette rather than painting a rectangle behind the model.
  renderer.domElement.style.filter =
    'brightness(1.20) saturate(1.38) drop-shadow(0 0 13px rgba(37,249,224,0.32))';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 70);
  camera.position.set(0.1, 0.1, 11.4);
  camera.lookAt(0, 0, 0);

  // Lighting tuned for the luminous turquoise / gold look.
  scene.add(new THREE.AmbientLight(0xd9fffd, 1.55));
  addPointLight(0xfef5d1, 4.2, [-4.4, 4.2, 7.4]);
  addPointLight(0x47fff2, 3.6, [4.6, -1.0, 4.0]);
  addPointLight(0xffcc67, 3.2, [2.8, 1.2, 6.2]);
  addPointLight(0x2b76ff, 2.0, [-2.2, -2.8, 4.5]);
  addPointLight(0x6ffff8, 1.7, [0.0, 6.0, -1.0]);
  addHemisphere(0xbefbf7, 0x001318, 1.0);

  function addPointLight(color, intensity, pos) {
    const light = new THREE.PointLight(color, intensity, 28);
    light.position.set(pos[0], pos[1], pos[2]);
    scene.add(light);
  }

  function addHemisphere(sky, ground, intensity) {
    const hemi = new THREE.HemisphereLight(sky, ground, intensity);
    scene.add(hemi);
  }

  const root = new THREE.Group();
  scene.add(root);
  root.position.set(-0.35, -0.2, 0);
  root.scale.setScalar(0.98);

  // Main organism group.
  const organism = new THREE.Group();
  organism.rotation.z = -0.42;
  organism.rotation.x = 0.1;
  organism.rotation.y = -0.1;
  root.add(organism);

  // Palettes / materials.
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: 0x9cfff2,
    emissive: 0x30f6e4,
    emissiveIntensity: 0.95,
    transparent: true,
    opacity: 0.27,
    transmission: 0.42,
    thickness: 0.65,
    ior: 1.2,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const shellGlowMat = new THREE.MeshBasicMaterial({
    color: 0xc5fffc,
    transparent: true,
    opacity: 0.13,
    side: THREE.BackSide,
    depthWrite: false
  });

  const cytoplasmMat = new THREE.MeshPhysicalMaterial({
    color: 0x146c6a,
    emissive: 0x0c6364,
    emissiveIntensity: 0.38,
    transparent: true,
    opacity: 0.22,
    roughness: 0.24,
    clearcoat: 0.35,
    metalness: 0.02,
    depthWrite: false
  });

  const turquoiseMat = new THREE.MeshStandardMaterial({
    color: 0xbafff9,
    emissive: 0x32f8e7,
    emissiveIntensity: 1.12,
    roughness: 0.24,
    metalness: 0.04
  });

  const turquoiseSoftMat = new THREE.MeshStandardMaterial({
    color: 0x66e8db,
    emissive: 0x169ca0,
    emissiveIntensity: 0.48,
    roughness: 0.28,
    metalness: 0.03
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffe7a4,
    emissive: 0xffb43e,
    emissiveIntensity: 1.1,
    roughness: 0.4,
    metalness: 0.05
  });

  const dnaMat = new THREE.MeshStandardMaterial({
    color: 0xa6d5ff,
    emissive: 0x3d76ff,
    emissiveIntensity: 1.4,
    roughness: 0.28,
    metalness: 0.04
  });

  const dnaSoftMat = new THREE.MeshStandardMaterial({
    color: 0x88bcff,
    emissive: 0x375cf8,
    emissiveIntensity: 1.05,
    roughness: 0.34,
    metalness: 0.03
  });

  const highlightDotMat = new THREE.MeshStandardMaterial({
    color: 0xffebc0,
    emissive: 0xffc351,
    emissiveIntensity: 1.4,
    roughness: 0.38,
    metalness: 0.08
  });

  function capsule(radius, length, material, radialSegments = 56, capSegments = 18) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments),
      material
    );
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  // Volume layers.
  const cytoplasm = capsule(0.98, 3.34, cytoplasmMat, 60, 18);
  cytoplasm.renderOrder = 0;
  organism.add(cytoplasm);

  const membrane = capsule(1.13, 3.48, membraneMat, 70, 18);
  membrane.renderOrder = 4;
  organism.add(membrane);

  const shellGlow = capsule(1.16, 3.54, shellGlowMat, 64, 18);
  shellGlow.renderOrder = 5;
  organism.add(shellGlow);

  // Subtle inner caustic layer for the translucent look.
  const innerCaustic = capsule(1.05, 3.4, new THREE.MeshBasicMaterial({
    color: 0x89fff2,
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
    depthWrite: false
  }), 48, 16);
  innerCaustic.renderOrder = 3;
  organism.add(innerCaustic);

  let seed = 48151623;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Fine cytoplasmic luminous particles.
  const particleGeom = new THREE.IcosahedronGeometry(0.028, 0);
  const particleMat = new THREE.MeshStandardMaterial({
    color: 0xe6fffc,
    emissive: 0x3bf7dc,
    emissiveIntensity: 0.95,
    transparent: true,
    opacity: 0.72,
    roughness: 0.72
  });
  const particles = new THREE.InstancedMesh(particleGeom, particleMat, 360);
  const particleDummy = new THREE.Object3D();
  for (let i = 0; i < 360; i++) {
    const x = -1.9 + random() * 3.8;
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 0.8;
    particleDummy.position.set(x, Math.cos(theta) * r, Math.sin(theta) * r);
    particleDummy.scale.setScalar(0.22 + random() * 0.95);
    particleDummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    particleDummy.updateMatrix();
    particles.setMatrixAt(i, particleDummy.matrix);
  }
  particles.instanceMatrix.needsUpdate = true;
  organism.add(particles);

  function tube(points, radius, material, tubularSegments = 200, radialSegments = 10, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed),
      material
    );
  }

  // Dense blue nucleoid: several intertwined long strands + translucent halo strands.
  const nucleoid = new THREE.Group();
  nucleoid.position.set(-0.18, 0.0, 0.0);
  nucleoid.rotation.y = 0.18;
  nucleoid.rotation.z = -0.08;
  organism.add(nucleoid);

  const dnaConfigs = [
    { phase: 0.0, ay: 0.23, az: 0.19, twist1: 3.4, twist2: 4.2, radius: 0.031, mat: dnaMat },
    { phase: 0.9, ay: 0.29, az: 0.24, twist1: 3.8, twist2: 4.7, radius: 0.028, mat: dnaMat },
    { phase: 1.8, ay: 0.34, az: 0.26, twist1: 4.4, twist2: 5.0, radius: 0.024, mat: dnaSoftMat },
    { phase: 2.7, ay: 0.25, az: 0.22, twist1: 5.2, twist2: 4.4, radius: 0.022, mat: dnaSoftMat },
    { phase: 3.5, ay: 0.32, az: 0.27, twist1: 4.8, twist2: 5.6, radius: 0.020, mat: dnaSoftMat }
  ];

  dnaConfigs.forEach((cfg, idx) => {
    const pts = [];
    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      const spine = -1.15 + 2.3 * t;
      const x = spine + 0.12 * Math.sin(t * Math.PI * 6.3 + cfg.phase) + 0.06 * Math.sin(t * Math.PI * 13.0 + cfg.phase * 0.6);
      const y = cfg.ay * Math.sin(t * Math.PI * cfg.twist1 + cfg.phase) + 0.08 * Math.sin(t * Math.PI * 8.4 + cfg.phase * 0.7);
      const z = cfg.az * Math.cos(t * Math.PI * cfg.twist2 + cfg.phase) + 0.06 * Math.cos(t * Math.PI * 7.5 + cfg.phase);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const strand = tube(pts, cfg.radius, cfg.mat, 230, 9, false);
    strand.renderOrder = 2;
    nucleoid.add(strand);

    // Discrete pearls along the main strands, giving the beaded luminous look.
    for (let j = 0; j < pts.length; j += 15) {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(idx < 2 ? 0.018 : 0.012, 8, 8),
        idx < 2 ? dnaMat : dnaSoftMat
      );
      bead.position.copy(pts[j]);
      nucleoid.add(bead);
    }
  });

  // Golden plasmids as rings with decorative beads.
  const plasmids = new THREE.Group();
  organism.add(plasmids);
  const plasmidSpecs = [
    { pos: [-1.36, -0.49, 0.26], r: 0.23, rot: [0.95, 0.24, 0.16] },
    { pos: [0.74, 0.46, 0.18], r: 0.18, rot: [0.74, -0.34, 0.34] },
    { pos: [0.96, -0.16, -0.14], r: 0.20, rot: [0.55, -0.72, 0.20] }
  ];
  plasmidSpecs.forEach((cfg, idx) => {
    const g = new THREE.Group();
    g.position.set(...cfg.pos);
    g.rotation.set(...cfg.rot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, 0.022, 10, 92), goldMat);
    g.add(ring);

    for (let j = 0; j < 14; j++) {
      const a = j / 14 * Math.PI * 2;
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(j % 2 === 0 ? 0.012 : 0.008, 8, 8),
        j % 2 === 0 ? highlightDotMat : goldMat
      );
      pearl.position.set(Math.cos(a) * cfg.r, Math.sin(a) * cfg.r, 0);
      g.add(pearl);
    }
    g.userData.spinDirection = idx % 2 === 0 ? 1 : -1;
    plasmids.add(g);
  });

  // Bright highlight nodules on the membrane.
  const highlightGeom = new THREE.SphereGeometry(0.08, 12, 12);
  const highlightCluster = new THREE.Group();
  organism.add(highlightCluster);
  [
    [-1.66, 0.39, 0.55], [-1.53, 0.28, 0.61], [-1.43, 0.46, 0.46],
    [0.38, 0.58, 0.66], [0.56, 0.48, 0.73], [0.76, 0.62, 0.52],
    [0.22, 0.42, 0.78], [1.05, 0.32, 0.51]
  ].forEach((p, i) => {
    const nod = new THREE.Mesh(highlightGeom, i % 2 === 0 ? highlightDotMat : goldMat);
    nod.position.set(p[0], p[1], p[2]);
    nod.scale.setScalar(0.65 + (i % 3) * 0.22);
    highlightCluster.add(nod);
  });

  // Dense pili over the full bacterial surface.
  const piliGroup = new THREE.Group();
  organism.add(piliGroup);
  const pilusMat = new THREE.MeshPhysicalMaterial({
    color: 0xc1fff9,
    emissive: 0x46f3e2,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.78,
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18
  });
  const pilusTipMat = new THREE.MeshBasicMaterial({
    color: 0xffdb84,
    transparent: true,
    opacity: 0.9
  });

  for (let i = 0; i < 165; i++) {
    const x = -1.9 + random() * 3.8;
    const theta = random() * Math.PI * 2;
    const localRadius = 1.08 + random() * 0.03;
    const base = new THREE.Vector3(x, Math.cos(theta) * localRadius, Math.sin(theta) * localRadius);
    const normal = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta)).normalize();
    const len = 0.10 + random() * 0.34;
    const bend = 0.07 + random() * 0.12;
    const tangent = new THREE.Vector3(0, -Math.sin(theta), Math.cos(theta)).multiplyScalar((random() - 0.5) * bend);
    const points = [
      base,
      base.clone().add(normal.clone().multiplyScalar(len * 0.45)).add(tangent.clone().multiplyScalar(0.35)),
      base.clone().add(normal.clone().multiplyScalar(len)).add(tangent)
    ];
    const hair = tube(points, 0.0055 + random() * 0.003, pilusMat, 18, 6, false);
    piliGroup.add(hair);

    if (random() > 0.45) {
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.008 + random() * 0.004, 6, 6), pilusTipMat);
      tip.position.copy(points[2]);
      piliGroup.add(tip);
    }
  }

  // Long flagella matching the supplied artwork more closely.
  const flagellaGroup = new THREE.Group();
  organism.add(flagellaGroup);
  const flagellumMat = new THREE.MeshPhysicalMaterial({
    color: 0xcffffa,
    emissive: 0x45fae9,
    emissiveIntensity: 1.22,
    transparent: true,
    opacity: 0.92,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  });
  const flagellumWarmMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff3c9,
    emissive: 0xffc55a,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.82,
    roughness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.14
  });

  const flagellaSpecs = [
    { start: [2.14, 0.36, 0.22], len: 3.2, rise: 1.34, sway: 0.68, phase: 0.0, r: 0.028 },
    { start: [2.08, 0.14, 0.02], len: 3.0, rise: 0.60, sway: 0.56, phase: 1.1, r: 0.026 },
    { start: [2.02, -0.04, -0.14], len: 3.1, rise: -0.08, sway: 0.50, phase: 2.3, r: 0.024 },
    { start: [1.96, -0.22, -0.24], len: 2.8, rise: -0.56, sway: 0.48, phase: 3.1, r: 0.021 }
  ];

  flagellaSpecs.forEach((cfg, idx) => {
    const pts = [];
    for (let i = 0; i <= 92; i++) {
      const t = i / 92;
      const swing = (0.12 + t * cfg.sway) * (0.45 + t * 0.65);
      pts.push(new THREE.Vector3(
        cfg.start[0] + t * cfg.len,
        cfg.start[1] + cfg.rise * t + Math.sin(t * Math.PI * 2.6 + cfg.phase) * swing,
        cfg.start[2] + Math.cos(t * Math.PI * 2.3 + cfg.phase) * swing * 0.7
      ));
    }
    const mat = idx % 2 === 0 ? flagellumMat : flagellumWarmMat;
    const mesh = tube(pts, cfg.r, mat, 240, 10, false);
    flagellaGroup.add(mesh);

    // warm highlight line overlay to mimic luminous streaks
    const overlay = tube(pts, cfg.r * 0.38, idx % 2 === 0 ? flagellumWarmMat : flagellumMat, 220, 8, false);
    overlay.material.transparent = true;
    overlay.material.opacity = 0.52;
    flagellaGroup.add(overlay);
  });

  // Membrane light streaks: short 3D curves *on* the curved surface.
  // These are part of the rotating geometry, not dots in the background.
  const streaks = new THREE.Group();
  organism.add(streaks);
  const streakMat = new THREE.MeshBasicMaterial({
    color: 0x8affed, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
    side: THREE.DoubleSide
  });
  const goldStreakMat = new THREE.MeshBasicMaterial({
    color: 0xffd48a, transparent: true, opacity: 0.36,
    blending: THREE.AdditiveBlending, depthWrite: false,
    side: THREE.DoubleSide
  });
  for (let k = 0; k < 65; k++) {
    const x0 = -1.65 + random() * 3.3;
    const theta0 = random() * Math.PI * 2;
    const span = (0.26 + random() * 0.9) * (random() > 0.5 ? 1 : -1);
    const pts = [];
    for (let j = 0; j <= 12; j++) {
      const u = j / 12;
      const a = theta0 + span * u;
      const r = 1.135 + 0.009 * Math.sin(u * Math.PI * 3 + theta0);
      pts.push(new THREE.Vector3(
        x0 + (u - 0.5) * 0.11,
        r * Math.cos(a),
        r * Math.sin(a)
      ));
    }
    streaks.add(tube(pts, 0.004 + random() * 0.003,
      k % 9 === 0 ? goldStreakMat : streakMat, 18));
  }

  // A faint volumetric outer corona, visible at grazing angles.
  const edgeCorona = capsule(1.18, 3.59,
    new THREE.MeshBasicMaterial({
      color: 0x38fbe6,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    }));
  edgeCorona.renderOrder = 6;
  organism.add(edgeCorona);

  // Resizing.
  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    camera.aspect = width / height;
    camera.position.z = width / height < 0.95 ? 12.9 : 11.4;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();

  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(mount);
  else window.addEventListener('resize', resize);

  // Pointer interaction.
  let dragging = false;
  let prevX = 0;
  let prevY = 0;
  let yawOffset = 0;
  let pitchOffset = 0;
  const canvas = renderer.domElement;

  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    prevX = event.clientX;
    prevY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    yawOffset += (event.clientX - prevX) * 0.008;
    pitchOffset = Math.max(-0.52, Math.min(0.52, pitchOffset + (event.clientY - prevY) * 0.006));
    prevX = event.clientX;
    prevY = event.clientY;
    if (prefersReducedMotion) renderer.render(scene, camera);
  });

  const stopDragging = () => { dragging = false; };
  canvas.addEventListener('pointerup', stopDragging);
  canvas.addEventListener('pointercancel', stopDragging);
  canvas.addEventListener('lostpointercapture', stopDragging);

  const clock = new THREE.Clock();
  let lastFrame = 0;
  let hasRendered = false;

  function renderFrame() {
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // True 360° rotation.
      root.rotation.y = (t * Math.PI * 2 / 22) + yawOffset;
      root.rotation.x = 0.11 + pitchOffset + 0.04 * Math.sin(t * 0.46);
      root.rotation.z = 0.03 * Math.sin(t * 0.27);
      root.position.y = -0.04 + 0.055 * Math.sin(t * 0.62);

      nucleoid.rotation.z = -0.08 + 0.05 * Math.sin(t * 0.8);
      nucleoid.rotation.x = 0.03 * Math.cos(t * 0.7);

      plasmids.children.forEach((g, i) => {
        g.rotation.z += 0.0022 * (g.userData.spinDirection || 1);
        g.rotation.x += 0.0009 * (i % 2 === 0 ? 1 : -1);
      });

      flagellaGroup.rotation.y = 0.055 * Math.sin(t * 0.88);
      flagellaGroup.rotation.z = 0.028 * Math.sin(t * 0.67);
      piliGroup.rotation.x = 0.01 * Math.sin(t * 0.35);
    } else {
      root.rotation.y = 0.45 + yawOffset;
      root.rotation.x = 0.18 + pitchOffset;
      root.rotation.z = 0.02;
    }

    renderer.render(scene, camera);

    if (!hasRendered) {
      hasRendered = true;
      mount.classList.add('is-ready');
    }
  }

  function animate(timestamp) {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }
    if (timestamp - lastFrame > 25 || !hasRendered) {
      lastFrame = timestamp;
      renderFrame();
    }
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    mount.classList.remove('is-ready');
    mount.classList.add('bacterium-fallback-only');
  });

  renderFrame();
  if (!prefersReducedMotion) requestAnimationFrame(animate);
  mount.classList.add('bacterium-interactive');
}
