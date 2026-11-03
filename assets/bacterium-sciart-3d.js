/*
 * SCI-ART BACTERIUM 3D
 * A real, procedural 3D scene rendered with Three.js / WebGL.
 * Artistic representation of a rod-shaped bacterium; not an anatomical model.
 * Designed for Francisco Dionísio's GitHub Pages academic homepage.
 * Three.js is loaded from jsDelivr; an existing image serves as an offline fallback.
 */

const mount = document.querySelector('[data-bacterium-3d]');

if (mount) {
  import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js')
    .then((THREE) => initialise3D(THREE, mount))
    .catch((error) => {
      console.warn('3D renderer unavailable; the original illustration remains visible.', error);
      mount.classList.add('bacterium-fallback-only');
    });
}

function initialise3D(THREE, mount) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = mq.matches;
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.42;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 60);
  camera.position.set(0.1, 0.1, 10.4);
  camera.lookAt(0, 0, 0);

  // Editorial lighting: aqua edge, soft amber highlights and depth from behind.
  scene.add(new THREE.AmbientLight(0xa6cbd0, 1.25));
  const lights = [
    [0xe4fff5, 3.4, [-3, 5, 6]],
    [0x64d9ce, 2.5, [4, -1, 4]],
    [0xf4be8d, 2.9, [-3, 0, -5]],
    [0x3973a1, 1.3, [3, 3, -5]]
  ];
  lights.forEach(([colour, power, position]) => {
    const light = new THREE.PointLight(colour, power, 20);
    light.position.set(...position);
    scene.add(light);
  });

  const root = new THREE.Group();
  scene.add(root);
  root.scale.setScalar(0.79);
  root.position.x = -0.35;
  const bacterium = new THREE.Group();
  bacterium.rotation.z = -0.17;
  root.add(bacterium);

  const phosphor = new THREE.MeshStandardMaterial({
    color: 0x94e7d8, emissive: 0x3ea892, emissiveIntensity: 0.52,
    roughness: 0.34, metalness: 0.09
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf8d7ac, emissive: 0x9b5a32, emissiveIntensity: 0.36,
    roughness: 0.43, metalness: 0.08
  });
  const mint = new THREE.MeshStandardMaterial({
    color: 0x92decf, emissive: 0x1d7c78, emissiveIntensity: 0.55,
    roughness: 0.27, metalness: 0.10
  });

  // Cell body: physically shaded rounded capsule plus two translucent envelopes.
  // CapsuleGeometry is oriented along Y by default; rotate into the X direction.
  function capsule(radius, length, material) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, 12, 44), material
    );
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  const cytoplasm = capsule(0.86, 2.82, new THREE.MeshPhysicalMaterial({
    color: 0x23535b, transparent: true, opacity: 0.38,
    roughness: 0.33, metalness: 0.03, clearcoat: 0.52,
    emissive: 0x16464d, emissiveIntensity: 0.14,
    depthWrite: false
  }));
  cytoplasm.renderOrder = 0;
  bacterium.add(cytoplasm);

  // Several hundred small translucent particles suggest cellular texture.
  // A fixed random seed makes the model deterministic across visits.
  let seed = 18029;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const ribosomeGeom = new THREE.IcosahedronGeometry(0.029, 0);
  const ribosomes = new THREE.InstancedMesh(
    ribosomeGeom,
    new THREE.MeshStandardMaterial({
      color: 0xd2f6e9, emissive: 0x579e94, emissiveIntensity: 0.5,
      roughness: 0.65, transparent: true, opacity: 0.78
    }),
    250
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 250; i++) {
    const x = -1.95 + random() * 3.9;
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 0.69;
    dummy.position.set(x, Math.cos(theta) * r, Math.sin(theta) * r);
    dummy.scale.setScalar(0.48 + random() * 1.2);
    dummy.rotation.set(random() * 6, random() * 6, random() * 6);
    dummy.updateMatrix();
    ribosomes.setMatrixAt(i, dummy.matrix);
  }
  ribosomes.instanceMatrix.needsUpdate = true;
  bacterium.add(ribosomes);

  // Sinuous DNA/nucleoid strands: genuine spatial curves inside the capsule.
  function tube(points, radius, material, closed = false, segments = 160) {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, segments, radius, 7, closed), material
    );
  }
  const dna = new THREE.Group();
  const strandA = [], strandB = [];
  for (let i = 0; i <= 165; i++) {
    const t = i / 165;
    const a = 2 * Math.PI * (3.2 * t + 0.18 * Math.sin(t * Math.PI * 4));
    const x = -1.48 + 2.96 * t;
    const axialDrift = 0.12 * Math.sin(t * Math.PI * 2);
    strandA.push(new THREE.Vector3(x, 0.34 * Math.cos(a) + axialDrift, 0.32 * Math.sin(a)));
    strandB.push(new THREE.Vector3(x, -0.34 * Math.cos(a) + axialDrift, -0.32 * Math.sin(a)));
  }
  dna.add(tube(strandA, 0.034, gold));
  dna.add(tube(strandB, 0.032, phosphor));
  for (let i = 5; i < 165; i += 7) {
    dna.add(tube([strandA[i], strandB[i]], 0.013, i % 2 ? gold : mint, false, 5));
  }
  dna.rotation.y = 0.17;
  dna.position.set(0, 0.03, 0.03);
  bacterium.add(dna);

  // Plasmids: independent *three-dimensional* closed DNA loops with tiny gene marks.
  const plasmids = new THREE.Group();
  bacterium.add(plasmids);
  const plasmidConfigs = [
    { pos: [-1.1, -0.30, 0.22], radius: 0.38, tilt: [0.60, 0.36, 0.22], colour: phosphor },
    { pos: [0.98, 0.28, -0.22], radius: 0.31, tilt: [0.35, -0.88, 0.65], colour: gold },
    { pos: [0.00, -0.31, -0.38], radius: 0.22, tilt: [0.98, 0.18, -0.31], colour: mint }
  ];
  plasmidConfigs.forEach((config, idx) => {
    const group = new THREE.Group();
    group.position.set(...config.pos);
    group.rotation.set(...config.tilt);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius, 0.026, 9, 80), config.colour
    );
    group.add(ring);
    for (let j = 0; j < 8; j++) {
      const angle = 2 * Math.PI * j / 8;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(j % 3 === 0 ? 0.050 : 0.030, 9, 7),
        j % 3 === 0 ? gold : config.colour
      );
      marker.position.set(config.radius * Math.cos(angle), config.radius * Math.sin(angle), 0);
      group.add(marker);
    }
    group.userData.index = idx;
    plasmids.add(group);
  });

  // Subtle spiral grooves on the outer surface accentuate volume as it turns.
  const grooveMat = new THREE.MeshBasicMaterial({
    color: 0x8bd9cd, transparent: true, opacity: 0.14,
    depthWrite: false
  });
  for (let i = 0; i < 10; i++) {
    const x = -1.47 + i * 0.327;
    const groove = new THREE.Mesh(
      new THREE.TorusGeometry(1.035, 0.006, 4, 80),
      grooveMat
    );
    groove.rotation.y = Math.PI / 2;
    groove.position.x = x;
    bacterium.add(groove);
  }

  // Pili: true protrusions distributed around the cell, with 3D orientation.
  const pilusCount = 110;
  const pilusGeometry = new THREE.CylinderGeometry(0.005, 0.021, 0.24, 5);
  const pili = new THREE.InstancedMesh(pilusGeometry, phosphor, pilusCount);
  const axis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pilusCount; i++) {
    const x = -1.48 + random() * 2.96;
    const theta = random() * Math.PI * 2;
    const direction = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta));
    const len = 0.16 + random() * 0.26;
    dummy.position.set(x, direction.y * (1.07 + len * 0.44), direction.z * (1.07 + len * 0.44));
    dummy.quaternion.setFromUnitVectors(axis, direction);
    dummy.scale.set(1, len / 0.24, 1);
    dummy.updateMatrix();
    pili.setMatrixAt(i, dummy.matrix);
  }
  pili.instanceMatrix.needsUpdate = true;
  bacterium.add(pili);

  // Waving flagella: glassy pastel fibres (spatial splines, not painted strokes).
  const flagella = new THREE.Group();
  bacterium.add(flagella);
  const flagellaMat = new THREE.MeshStandardMaterial({
    color: 0xb6edda, emissive: 0x2d9289, emissiveIntensity: 0.46,
    roughness: 0.42, transparent: true, opacity: 0.88
  });
  [
    { y: 0.27, z: 0.28, phase: 0.1, length: 1.86 },
    { y: -0.03, z: -0.20, phase: 1.25, length: 2.14 },
    { y: -0.33, z: 0.13, phase: 2.55, length: 1.58 }
  ].forEach((f, idx) => {
    const points = [];
    for (let i = 0; i <= 56; i++) {
      const t = i / 56;
      const swing = t * t * 0.43;
      points.push(new THREE.Vector3(
        2.53 + t * f.length,
        f.y + Math.sin(t * Math.PI * 3 + f.phase) * swing,
        f.z + Math.cos(t * Math.PI * 2.7 + f.phase) * swing
      ));
    }
    const filament = tube(points, 0.019 - idx * 0.002, flagellaMat);
    flagella.add(filament);
  });

  // Outer membrane is drawn after internal structures to keep them visible.
  const envelope = capsule(1.055, 3.01, new THREE.MeshPhysicalMaterial({
    color: 0x6fcdbf,
    transparent: true,
    opacity: 0.25,
    roughness: 0.20,
    metalness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    emissive: 0x2a7b79,
    emissiveIntensity: 0.19,
    depthWrite: false,
    side: THREE.DoubleSide
  }));
  envelope.renderOrder = 3;
  bacterium.add(envelope);

  const outerRim = capsule(1.09, 3.03, new THREE.MeshBasicMaterial({
    color: 0xb6fff0,
    transparent: true,
    opacity: 0.075,
    side: THREE.BackSide,
    depthWrite: false
  }));
  outerRim.renderOrder = 4;
  bacterium.add(outerRim);

  // An independent halo/background makes the model feel like sci-art rather
  // than a conventional textbook diagram.
  const starPositions = new Float32Array(110 * 3);
  for (let i = 0; i < 110; i++) {
    starPositions[3 * i] = (random() - 0.5) * 10;
    starPositions[3 * i + 1] = (random() - 0.5) * 7.4;
    starPositions[3 * i + 2] = -1.8 - random() * 4;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
    color: 0xc9e7df, size: 0.024,
    transparent: true, opacity: 0.43,
    sizeAttenuation: true, depthWrite: false
  }));
  // scene.add(stars);

  // Camera framing responds to the panel dimensions.
  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    camera.aspect = width / height;
    camera.position.z = width / height < 0.95 ? 12.4 : 10.4;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(mount);
  else window.addEventListener('resize', resize);

  let drag = false;
  let previousX = 0;
  let previousY = 0;
  let yawOffset = 0;
  let pitchOffset = 0;
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', (event) => {
    drag = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    yawOffset += (event.clientX - previousX) * 0.008;
    pitchOffset = Math.max(-0.45, Math.min(0.45, pitchOffset + (event.clientY - previousY) * 0.006));
    previousX = event.clientX;
    previousY = event.clientY;
    if (reduceMotion) renderer.render(scene, camera);
  });
  const stopDrag = () => { drag = false; };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
  canvas.addEventListener('lostpointercapture', stopDrag);

  const clock = new THREE.Clock();
  let last = 0;
  let hasRendered = false;
  function renderFrame() {
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      // One full turn every 17 seconds, with subtle organic movement.
      root.rotation.y = (t * 2 * Math.PI / 17) + yawOffset;
      root.rotation.x = 0.09 + pitchOffset + 0.045 * Math.sin(t * 0.53);
      root.rotation.z = 0.08 * Math.sin(t * 0.33);
      root.position.y = 0.06 * Math.sin(t * 0.69);
      plasmids.children.forEach((ring, idx) => {
        ring.rotation.z = plasmidConfigs[idx].tilt[2] + t * (idx % 2 === 0 ? 0.15 : -0.12);
      });
      flagella.rotation.y = 0.06 * Math.sin(t * 1.1);
      stars.rotation.z = 0.004 * Math.sin(t * 0.16);
    } else {
      root.rotation.y = 0.44 + yawOffset;
      root.rotation.x = 0.14 + pitchOffset;
      root.rotation.z = 0.10;
    }
    renderer.render(scene, camera);
    if (!hasRendered) {
      hasRendered = true;
      mount.classList.add('is-ready');
    }
  }
  function animate(time) {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }
    // Prevent excessive GPU work on high-refresh-rate monitors.
    if (time - last > 25 || !hasRendered) {
      last = time;
      renderFrame();
    }
    if (!reduceMotion) requestAnimationFrame(animate);
  }
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    mount.classList.remove('is-ready');
    mount.classList.add('bacterium-fallback-only');
  });

  renderFrame();
  if (!reduceMotion) requestAnimationFrame(animate);
  mount.classList.add('bacterium-interactive');
}
