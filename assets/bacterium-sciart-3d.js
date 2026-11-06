/*
 * bacterium-sciart-3d.js
 * New clean 3D bacterium from scratch
 * Transparent cyan bacterium with chromosome, plasmids, pili and flagella
 * Built with Three.js
 */

const mount = document.querySelector('[data-bacterium-3d]');

if (mount) {
  import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js')
    .then((THREE) => {
      initBacterium3D(THREE, mount);
    })
    .catch((error) => {
      console.warn('Could not load Three.js; using fallback image.', error);
      mount.classList.add('bacterium-fallback-only');
    });
}

function initBacterium3D(THREE, mount) {
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
  renderer.toneMappingExposure = 1.85;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.1, 12);

  // ------------------------------------------------------------
  // LIGHTS
  // ------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0xd8ffff, 1.15));

  const hemi = new THREE.HemisphereLight(0xbffdfb, 0x021116, 1.05);
  scene.add(hemi);

  addPointLight(0xffffff, 2.1, [-4.8, 4.0, 7.0]);
  addPointLight(0x49fff2, 2.5, [4.3, -0.8, 5.0]);
  addPointLight(0xffd680, 1.8, [2.5, 1.0, 5.5]);
  addPointLight(0x2a6fff, 1.4, [-2.0, -2.5, 4.0]);

  function addPointLight(color, intensity, pos) {
    const light = new THREE.PointLight(color, intensity, 40);
    light.position.set(pos[0], pos[1], pos[2]);
    scene.add(light);
  }

  // ------------------------------------------------------------
  // ROOT GROUP
  // ------------------------------------------------------------
  const root = new THREE.Group();
  scene.add(root);
  root.position.set(0.35, -0.25, 0);

  const bacterium = new THREE.Group();
  bacterium.rotation.z = -0.45;
  bacterium.rotation.x = 0.12;
  root.add(bacterium);

  // ------------------------------------------------------------
  // MATERIALS
  // ------------------------------------------------------------
  const membraneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8ffcf2,
    emissive: 0x18cfc7,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.28,
    transmission: 0.58,
    thickness: 0.7,
    ior: 1.18,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const innerBodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0d4f52,
    emissive: 0x0d7a7e,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.22,
    roughness: 0.28,
    clearcoat: 0.25,
    metalness: 0.02,
    depthWrite: false
  });

  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xbafff7,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    depthWrite: false
  });

  const chromosomeMaterial = new THREE.MeshStandardMaterial({
    color: 0x9dcbff,
    emissive: 0x3972ff,
    emissiveIntensity: 0.75,
    roughness: 0.22,
    metalness: 0.03
  });

  const chromosomeSoftMaterial = new THREE.MeshStandardMaterial({
    color: 0x76b0ff,
    emissive: 0x2450dd,
    emissiveIntensity: 0.42,
    roughness: 0.3,
    metalness: 0.02
  });

  const plasmidMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe59b,
    emissive: 0xffb54f,
    emissiveIntensity: 0.75,
    roughness: 0.35,
    metalness: 0.04
  });

  const piliMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xacfff8,
    emissive: 0x2ae0d3,
    emissiveIntensity: 0.58,
    transparent: true,
    opacity: 0.82,
    roughness: 0.28,
    clearcoat: 0.7,
    clearcoatRoughness: 0.16
  });

  const piliTipMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd98a,
    transparent: true,
    opacity: 0.92
  });

  const flagellumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc8fff9,
    emissive: 0x45efe0,
    emissiveIntensity: 0.72,
    transparent: true,
    opacity: 0.94,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  });

  const flagellumWarmMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff0c4,
    emissive: 0xf0b24a,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.72,
    roughness: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1
  });

  const particleMaterial = new THREE.MeshStandardMaterial({
    color: 0xcafffa,
    emissive: 0x19f1d5,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.78,
    roughness: 0.7
  });

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------
  function makeCapsule(radius, length, material, radialSegments = 48, capSegments = 18) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments),
      material
    );
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  function makeTube(points, radius, material, tubularSegments = 160, radialSegments = 8, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed),
      material
    );
  }

  let seed = 32719;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // ------------------------------------------------------------
  // MAIN BACTERIAL BODY
  // ------------------------------------------------------------
  const innerBody = makeCapsule(0.97, 3.35, innerBodyMaterial, 56, 18);
  bacterium.add(innerBody);

  const membrane = makeCapsule(1.12, 3.55, membraneMaterial, 64, 18);
  bacterium.add(membrane);

  const outerGlow = makeCapsule(1.15, 3.6, outerGlowMaterial, 56, 18);
  bacterium.add(outerGlow);

  // ------------------------------------------------------------
  // CYTOPLASMIC PARTICLES
  // ------------------------------------------------------------
  const particleGeometry = new THREE.IcosahedronGeometry(0.024, 0);
  const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, 240);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < 240; i++) {
    const x = -1.9 + random() * 3.8;
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 0.72;

    dummy.position.set(
      x,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );

    const s = 0.25 + random() * 0.75;
    dummy.scale.setScalar(s);

    dummy.rotation.set(
      random() * Math.PI,
      random() * Math.PI,
      random() * Math.PI
    );

    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);
  }

  particleMesh.instanceMatrix.needsUpdate = true;
  bacterium.add(particleMesh);

  // ------------------------------------------------------------
  // CHROMOSOME
  // ------------------------------------------------------------
  const chromosomeGroup = new THREE.Group();
  chromosomeGroup.position.set(-0.15, 0, 0);
  bacterium.add(chromosomeGroup);

  const chromosomeConfigs = [
    { phase: 0.0, ay: 0.28, az: 0.21, f1: 3.8, f2: 4.3, radius: 0.032, material: chromosomeMaterial },
    { phase: 0.9, ay: 0.24, az: 0.19, f1: 4.4, f2: 4.8, radius: 0.028, material: chromosomeMaterial },
    { phase: 1.9, ay: 0.31, az: 0.23, f1: 5.2, f2: 4.6, radius: 0.023, material: chromosomeSoftMaterial },
    { phase: 2.6, ay: 0.27, az: 0.22, f1: 4.7, f2: 5.4, radius: 0.021, material: chromosomeSoftMaterial }
  ];

  chromosomeConfigs.forEach((cfg, idx) => {
    const points = [];

    for (let i = 0; i <= 170; i++) {
      const t = i / 170;

      const x =
        -1.1 + 2.2 * t +
        0.10 * Math.sin(t * Math.PI * 5.5 + cfg.phase) +
        0.05 * Math.sin(t * Math.PI * 11.0 + cfg.phase * 0.7);

      const y =
        cfg.ay * Math.sin(t * Math.PI * cfg.f1 + cfg.phase) +
        0.07 * Math.sin(t * Math.PI * 8.0 + cfg.phase);

      const z =
        cfg.az * Math.cos(t * Math.PI * cfg.f2 + cfg.phase) +
        0.06 * Math.cos(t * Math.PI * 7.2 + cfg.phase);

      points.push(new THREE.Vector3(x, y, z));
    }

    const strand = makeTube(points, cfg.radius, cfg.material, 220, 9, false);
    chromosomeGroup.add(strand);

    for (let j = 0; j < points.length; j += 14) {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(idx < 2 ? 0.016 : 0.011, 8, 8),
        idx < 2 ? chromosomeMaterial : chromosomeSoftMaterial
      );
      bead.position.copy(points[j]);
      chromosomeGroup.add(bead);
    }
  });

  // ------------------------------------------------------------
  // PLASMIDS
  // ------------------------------------------------------------
  const plasmidGroup = new THREE.Group();
  bacterium.add(plasmidGroup);

  const plasmidSpecs = [
    { pos: [-1.35, -0.48, 0.24], r: 0.23, rot: [0.8, 0.2, 0.1] },
    { pos: [0.84, 0.44, 0.18], r: 0.18, rot: [0.65, -0.25, 0.35] },
    { pos: [0.98, -0.12, -0.16], r: 0.20, rot: [0.5, -0.6, 0.18] }
  ];

  plasmidSpecs.forEach((cfg, idx) => {
    const group = new THREE.Group();
    group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    group.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r, 0.02, 10, 70),
      plasmidMaterial
    );
    group.add(ring);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(i % 2 === 0 ? 0.010 : 0.007, 8, 8),
        plasmidMaterial
      );
      pearl.position.set(Math.cos(a) * cfg.r, Math.sin(a) * cfg.r, 0);
      group.add(pearl);
    }

    group.userData.spinDirection = idx % 2 === 0 ? 1 : -1;
    plasmidGroup.add(group);
  });

  // ------------------------------------------------------------
  // PILI
  // ------------------------------------------------------------
  const piliGroup = new THREE.Group();
  bacterium.add(piliGroup);

  for (let i = 0; i < 150; i++) {
    const x = -1.9 + random() * 3.8;
    const theta = random() * Math.PI * 2;
    const baseRadius = 1.08 + random() * 0.03;

    const base = new THREE.Vector3(
      x,
      Math.cos(theta) * baseRadius,
      Math.sin(theta) * baseRadius
    );

    const normal = new THREE.Vector3(
      0,
      Math.cos(theta),
      Math.sin(theta)
    ).normalize();

    const tangent = new THREE.Vector3(
      0,
      -Math.sin(theta),
      Math.cos(theta)
    ).multiplyScalar((random() - 0.5) * 0.12);

    const len = 0.12 + random() * 0.28;

    const points = [
      base,
      base.clone()
        .add(normal.clone().multiplyScalar(len * 0.45))
        .add(tangent.clone().multiplyScalar(0.25)),
      base.clone()
        .add(normal.clone().multiplyScalar(len))
        .add(tangent)
    ];

    const pilus = makeTube(points, 0.005 + random() * 0.0025, piliMaterial, 18, 6, false);
    piliGroup.add(pilus);

    if (random() > 0.48) {
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.008 + random() * 0.003, 6, 6),
        piliTipMaterial
      );
      tip.position.copy(points[2]);
      piliGroup.add(tip);
    }
  }

  // ------------------------------------------------------------
  // FLAGELLA
  // ------------------------------------------------------------
  const flagellaGroup = new THREE.Group();
  bacterium.add(flagellaGroup);

  const flagellaSpecs = [
    { start: [2.05, 0.32, 0.18], len: 3.2, rise: 1.20, sway: 0.68, phase: 0.0, radius: 0.027 },
    { start: [2.00, 0.12, 0.02], len: 3.0, rise: 0.52, sway: 0.56, phase: 1.0, radius: 0.025 },
    { start: [1.95, -0.08, -0.12], len: 3.0, rise: -0.06, sway: 0.50, phase: 2.2, radius: 0.023 },
    { start: [1.90, -0.24, -0.20], len: 2.8, rise: -0.54, sway: 0.45, phase: 3.1, radius: 0.021 }
  ];

  flagellaSpecs.forEach((cfg, index) => {
    const points = [];

    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const curveAmp = (0.10 + t * cfg.sway) * (0.45 + t * 0.65);

      points.push(new THREE.Vector3(
        cfg.start[0] + t * cfg.len,
        cfg.start[1] + cfg.rise * t + Math.sin(t * Math.PI * 2.5 + cfg.phase) * curveAmp,
        cfg.start[2] + Math.cos(t * Math.PI * 2.2 + cfg.phase) * curveAmp * 0.7
      ));
    }

    const core = makeTube(points, cfg.radius, flagellumMaterial, 230, 10, false);
    flagellaGroup.add(core);

    const overlay = makeTube(points, cfg.radius * 0.38, flagellumWarmMaterial, 220, 8, false);
    overlay.material.transparent = true;
    overlay.material.opacity = 0.55;
    flagellaGroup.add(overlay);
  });

  // ------------------------------------------------------------
  // SOFT HIGHLIGHTS ON THE MEMBRANE
  // ------------------------------------------------------------
  const highlightGroup = new THREE.Group();
  bacterium.add(highlightGroup);

  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffefbf,
    emissive: 0xf6b450,
    emissiveIntensity: 0.9,
    roughness: 0.34,
    metalness: 0.05
  });

  [
    [-1.65, 0.36, 0.55],
    [-1.50, 0.28, 0.48],
    [0.26, 0.48, 0.70],
    [0.48, 0.56, 0.64],
    [0.72, 0.52, 0.52]
  ].forEach((p, i) => {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + (i % 2) * 0.02, 10, 10),
      highlightMaterial
    );
    glow.position.set(p[0], p[1], p[2]);
    highlightGroup.add(glow);
  });

  // ------------------------------------------------------------
  // RESIZE
  // ------------------------------------------------------------
  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);

    camera.aspect = width / height;
    camera.position.z = width / height < 0.95 ? 13.2 : 12.0;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  resize();

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(resize)
    : null;

  if (resizeObserver) {
    resizeObserver.observe(mount);
  } else {
    window.addEventListener('resize', resize);
  }

  // ------------------------------------------------------------
  // POINTER INTERACTION
  // ------------------------------------------------------------
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
    pitchOffset += (event.clientY - prevY) * 0.006;
    pitchOffset = Math.max(-0.45, Math.min(0.45, pitchOffset));

    prevX = event.clientX;
    prevY = event.clientY;

    if (prefersReducedMotion) {
      renderFrame();
    }
  });

  function stopDragging() {
    dragging = false;
  }

  canvas.addEventListener('pointerup', stopDragging);
  canvas.addEventListener('pointercancel', stopDragging);
  canvas.addEventListener('lostpointercapture', stopDragging);

  // ------------------------------------------------------------
  // ANIMATION
  // ------------------------------------------------------------
  const clock = new THREE.Clock();
  let hasRendered = false;

  function renderFrame() {
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      root.rotation.y = (t * Math.PI * 2) / 24 + yawOffset; // one full turn every 24s
      root.rotation.x = 0.10 + pitchOffset + 0.04 * Math.sin(t * 0.45);
      root.rotation.z = 0.02 * Math.sin(t * 0.22);

      root.position.y = -0.04 + 0.05 * Math.sin(t * 0.60);

      chromosomeGroup.rotation.z = 0.04 * Math.sin(t * 0.7);
      chromosomeGroup.rotation.x = 0.03 * Math.cos(t * 0.65);

      flagellaGroup.rotation.y = 0.05 * Math.sin(t * 0.85);
      flagellaGroup.rotation.z = 0.025 * Math.sin(t * 0.6);

      plasmidGroup.children.forEach((item) => {
        item.rotation.z += 0.002 * (item.userData.spinDirection || 1);
      });
    } else {
      root.rotation.y = 0.55 + yawOffset;
      root.rotation.x = 0.15 + pitchOffset;
    }

    renderer.render(scene, camera);

    if (!hasRendered) {
      hasRendered = true;
      mount.classList.add('is-ready');
    }
  }

  function animate() {
    renderFrame();
    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    mount.classList.remove('is-ready');
    mount.classList.add('bacterium-fallback-only');
  });

  renderFrame();

  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }

  mount.classList.add('bacterium-interactive');
}
