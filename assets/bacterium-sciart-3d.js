
/*
 * SCI-ART BACTERIUM 3D — updated to match the luminous bacterium image:
 * cyan translucent body, blue nucleoid, golden plasmids and long flowing flagella.
 * Drop-in replacement for assets/bacterium-sciart-3d.js
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
  renderer.toneMappingExposure = 1.55;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 60);
  camera.position.set(0.2, 0.05, 10.8);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xc8f2f5, 1.55));
  const lights = [
    [0xe9fff7, 3.9, [-3, 4.5, 6]],
    [0x3bf2ee, 3.3, [4.5, -1, 4]],
    [0xffd483, 2.8, [-4, 0.5, -4.5]],
    [0x1c4eff, 1.6, [1, -2, 3]],
    [0x89fff2, 1.2, [0, 6, -3]]
  ];
  lights.forEach(([colour, power, position]) => {
    const light = new THREE.PointLight(colour, power, 24);
    light.position.set(...position);
    scene.add(light);
  });

  const root = new THREE.Group();
  scene.add(root);
  root.scale.setScalar(0.94);
  root.position.set(-0.2, -0.25, 0);

  const bacterium = new THREE.Group();
  bacterium.rotation.z = -0.44;
  bacterium.rotation.x = 0.08;
  root.add(bacterium);

  const aqua = new THREE.MeshStandardMaterial({
    color: 0x8ef4ea,
    emissive: 0x27bcb9,
    emissiveIntensity: 0.62,
    roughness: 0.28,
    metalness: 0.05
  });
  const teal = new THREE.MeshStandardMaterial({
    color: 0x63e3d7,
    emissive: 0x149999,
    emissiveIntensity: 0.55,
    roughness: 0.24,
    metalness: 0.04
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf5d892,
    emissive: 0xa85c20,
    emissiveIntensity: 0.42,
    roughness: 0.42,
    metalness: 0.06
  });
  const blue = new THREE.MeshStandardMaterial({
    color: 0x86bbff,
    emissive: 0x2955ff,
    emissiveIntensity: 0.44,
    roughness: 0.36,
    metalness: 0.04
  });

  function capsule(radius, length, material) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, 14, 48), material
    );
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  // interior body
  const cytoplasm = capsule(0.95, 3.35, new THREE.MeshPhysicalMaterial({
    color: 0x1f504f,
    transparent: true,
    opacity: 0.42,
    roughness: 0.26,
    metalness: 0.02,
    clearcoat: 0.4,
    emissive: 0x0c4348,
    emissiveIntensity: 0.2,
    depthWrite: false
  }));
  cytoplasm.renderOrder = 0;
  bacterium.add(cytoplasm);

  let seed = 27011;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const speckGeom = new THREE.IcosahedronGeometry(0.03, 0);
  const specks = new THREE.InstancedMesh(
    speckGeom,
    new THREE.MeshStandardMaterial({
      color: 0xd5fff6,
      emissive: 0x2ef0d5,
      emissiveIntensity: 0.55,
      roughness: 0.7,
      transparent: true,
      opacity: 0.7
    }),
    260
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 260; i++) {
    const x = -1.95 + random() * 3.9;
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 0.78;
    dummy.position.set(x, Math.cos(theta) * r, Math.sin(theta) * r);
    dummy.scale.setScalar(0.38 + random() * 1.15);
    dummy.rotation.set(random() * 6, random() * 6, random() * 6);
    dummy.updateMatrix();
    specks.setMatrixAt(i, dummy.matrix);
  }
  specks.instanceMatrix.needsUpdate = true;
  bacterium.add(specks);

  function tube(points, radius, material, closed = false, segments = 180) {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, segments, radius, 8, closed), material
    );
  }

  // Blue nucleoid closer to the supplied still image.
  const dna = new THREE.Group();
  const loops = [];
  for (let l = 0; l < 5; l++) {
    const pts = [];
    const phase = l * 0.9;
    const ampY = 0.26 + l * 0.035;
    const ampZ = 0.22 + l * 0.03;
    for (let i = 0; i <= 150; i++) {
      const t = i / 150;
      const x = -1.25 + 2.5 * t + 0.12 * Math.sin(t * Math.PI * 6 + phase);
      const y = ampY * Math.sin(t * Math.PI * (3.4 + 0.4 * l) + phase);
      const z = ampZ * Math.cos(t * Math.PI * (4.0 + 0.25 * l) + phase);
      pts.push(new THREE.Vector3(x, y, z));
    }
    loops.push(pts);
    dna.add(tube(pts, 0.028 + (l % 2) * 0.006, blue, false, 170));
  }
  dna.rotation.y = 0.18;
  dna.position.set(-0.1, 0.03, 0.02);
  bacterium.add(dna);

  // Golden plasmids positioned like the still image.
  const plasmids = new THREE.Group();
  bacterium.add(plasmids);
  const plasmidConfigs = [
    { pos: [-1.38, -0.45, 0.28], radius: 0.22, tilt: [0.95, 0.2, 0.18] },
    { pos: [0.78, 0.48, 0.14], radius: 0.18, tilt: [0.72, -0.35, 0.35] },
    { pos: [0.92, -0.18, -0.18], radius: 0.20, tilt: [0.55, -0.75, 0.15] }
  ];
  plasmidConfigs.forEach((config, idx) => {
    const group = new THREE.Group();
    group.position.set(...config.pos);
    group.rotation.set(...config.tilt);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius, 0.024, 10, 80), gold
    );
    group.add(ring);
    for (let j = 0; j < 10; j++) {
      const angle = 2 * Math.PI * j / 10;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(j % 2 === 0 ? 0.016 : 0.010, 8, 8),
        aqua
      );
      marker.position.set(config.radius * Math.cos(angle), config.radius * Math.sin(angle), 0);
      group.add(marker);
    }
    group.userData.index = idx;
    plasmids.add(group);
  });

  // Outer membrane with glowing rim.
  const envelope = capsule(1.12, 3.48, new THREE.MeshPhysicalMaterial({
    color: 0x7dfff2,
    transparent: true,
    opacity: 0.26,
    roughness: 0.18,
    metalness: 0.02,
    transmission: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: 0x2dbdb6,
    emissiveIntensity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide
  }));
  envelope.renderOrder = 3;
  bacterium.add(envelope);

  const outerRim = capsule(1.14, 3.52, new THREE.MeshBasicMaterial({
    color: 0xd8fffb,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    depthWrite: false
  }));
  outerRim.renderOrder = 4;
  bacterium.add(outerRim);

  // Pili: many bright surface hairs.
  const pilusCount = 125;
  const pilusGeometry = new THREE.CylinderGeometry(0.0045, 0.017, 0.28, 5);
  const pili = new THREE.InstancedMesh(pilusGeometry, aqua, pilusCount);
  const axis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pilusCount; i++) {
    const x = -1.7 + random() * 3.4;
    const theta = random() * Math.PI * 2;
    const direction = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta));
    const len = 0.17 + random() * 0.29;
    dummy.position.set(x, direction.y * (1.13 + len * 0.45), direction.z * (1.13 + len * 0.45));
    dummy.quaternion.setFromUnitVectors(axis, direction);
    dummy.scale.set(1, len / 0.28, 1);
    dummy.updateMatrix();
    pili.setMatrixAt(i, dummy.matrix);
  }
  pili.instanceMatrix.needsUpdate = true;
  bacterium.add(pili);

  // Three long glowing flagella flowing toward the upper-right.
  const flagella = new THREE.Group();
  bacterium.add(flagella);
  const flagellaMat = new THREE.MeshPhysicalMaterial({
    color: 0xb3fff7,
    emissive: 0x35d8d4,
    emissiveIntensity: 0.58,
    roughness: 0.28,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  });
  [
    { y: 0.34, z: 0.24, phase: 0.15, length: 2.75, rise: 0.85 },
    { y: 0.10, z: -0.04, phase: 1.2, length: 2.5, rise: 0.46 },
    { y: -0.15, z: -0.26, phase: 2.2, length: 2.35, rise: 0.18 }
  ].forEach((f, idx) => {
    const points = [];
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
      const sway = (0.18 + t * 0.4) * (0.5 + 0.5 * t);
      points.push(new THREE.Vector3(
        2.62 + t * f.length,
        f.y + f.rise * t + Math.sin(t * Math.PI * 2.8 + f.phase) * sway,
        f.z + Math.cos(t * Math.PI * 2.4 + f.phase) * sway * 0.8
      ));
    }
    const filament = tube(points, 0.022 - idx * 0.003, flagellaMat, false, 190);
    flagella.add(filament);
  });

  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    camera.aspect = width / height;
    camera.position.z = width / height < 0.95 ? 12.7 : 10.8;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
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
      root.rotation.y = (t * 2 * Math.PI / 18) + yawOffset;
      root.rotation.x = 0.12 + pitchOffset + 0.038 * Math.sin(t * 0.5);
      root.rotation.z = 0.05 * Math.sin(t * 0.32);
      root.position.y = -0.03 + 0.05 * Math.sin(t * 0.66);
      plasmids.children.forEach((ring, idx) => {
        ring.rotation.z = plasmidConfigs[idx].tilt[2] + t * (idx % 2 === 0 ? 0.14 : -0.11);
      });
      flagella.rotation.y = 0.045 * Math.sin(t * 1.0);
      flagella.rotation.z = 0.03 * Math.sin(t * 0.75);
    } else {
      root.rotation.y = 0.52 + yawOffset;
      root.rotation.x = 0.16 + pitchOffset;
      root.rotation.z = 0.06;
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
