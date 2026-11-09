
/*
 * BACTERIUM 3D — hollow black interior, luminous wool-like chromosome.
 * Replace the entire assets/bacterium-sciart-3d.js with this file.
 * Three.js v0.165.0; transparent canvas; three independently animated cells.
 * Main bacterium: 12s per turn. Second bacterium: 6s per axial turn,
 * alternating travel direction every 26s. Third bacterium: 11s per axial
 * turn, diagonal upward-right journeys (28s) and random re-entry points.
 */

const mount = document.querySelector('[data-bacterium-3d]');
if (mount) {
  import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js')
    .then(THREE => startBacterium(THREE, mount))
    .catch(err => {
      console.error('Não foi possível iniciar a bactéria 3D:', err);
      mount.classList.add('bacterium-fallback-only');
    });
}

function startBacterium(T, mount) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new T.Scene();
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const camera = new T.PerspectiveCamera(39, 1, 0.1, 50);
  camera.position.set(0, 0, 10.5);
  scene.add(new T.AmbientLight(0xffffff, 1.3));
  const lamp = new T.PointLight(0x80fff0, 25, 25);
  lamp.position.set(-4, 4, 6);
  scene.add(lamp);

  const turner = new T.Group();
  scene.add(turner);
  turner.position.x = -0.38;
  turner.scale.setScalar(0.80);
  const cell = new T.Group();
  cell.rotation.z = -0.38;
  turner.add(cell);

  // No solid cytoplasm: this is deliberate. The black surface is rendered
  // ONLY on the inner/back side; the front remains open for a clear view.
  const R = 0.93, L = 3.05;
  function capsule(radius, length, material) {
    const mesh = new T.Mesh(new T.CapsuleGeometry(radius, length, 18, 56), material);
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }
  const blackBack = capsule(R, L, new T.MeshBasicMaterial({
    color: 0x000000, side: T.BackSide, depthWrite: false
  }));
  blackBack.renderOrder = -20;
  cell.add(blackBack);

  // Fresnel transparency: nearly invisible at the centre and a glowing
  // turquoise outline at glancing angles. No coloured fill.
  const membrane = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: T.FrontSide,
    blending: T.AdditiveBlending,
    uniforms: { tint: { value: new T.Color(0x36f9e4) } },
    vertexShader: `
      varying vec3 vNormalView, vDirection;
      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vDirection = normalize(-p.xyz);
        gl_Position = projectionMatrix * p;
      }
    `,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 vNormalView, vDirection;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormalView),
                                       normalize(vDirection))), 2.0);
        float alpha = 0.008 + 0.67 * rim;
        gl_FragColor = vec4(tint, alpha);
      }
    `
  });
  const glass = capsule(R + 0.015, L + 0.02, membrane);
  glass.renderOrder = 20;
  cell.add(glass);

  const blue = new T.MeshBasicMaterial({ color: 0x4a8cff });
  const ice = new T.MeshBasicMaterial({ color: 0xd7f4ff });
  const pink = new T.MeshBasicMaterial({ color: 0xa65dff });
  const gold = new T.MeshBasicMaterial({ color: 0xffbc4a });
  const cream = new T.MeshBasicMaterial({ color: 0xfff1b5 });
  const aqua = new T.MeshBasicMaterial({ color: 0x57fff0 });
  const filamentGlow = new T.MeshBasicMaterial({
    color: 0x376dff, transparent: true, opacity: 0.16,
    blending: T.AdditiveBlending, depthWrite: false
  });
  function meshTube(curve, radius, material, steps = 160) {
    return new T.Mesh(new T.TubeGeometry(curve, steps, radius, 7, curve.closed), material);
  }
  function path(points, closed = false) {
    return new T.CatmullRomCurve3(points, closed, 'centripetal');
  }

  // ONE continuous, convoluted chromosome. Fine helically wrapped fibres
  // create the fluorescent 'cordão de lã' texture.
  const chromosome = new T.Group();
  cell.add(chromosome);
  const spine = [];
  for (let i = 0; i < 420; i++) {
    const u = i / 420 * Math.PI * 2;
    spine.push(new T.Vector3(
      1.04 * Math.sin(2 * u) + 0.14 * Math.sin(13 * u),
      0.30 * Math.sin(7 * u) + 0.15 * Math.cos(11 * u),
      0.28 * Math.cos(5 * u) + 0.14 * Math.sin(9 * u)
    ));
  }
  const centralCurve = path(spine, true);
  chromosome.add(meshTube(centralCurve, 0.063, filamentGlow, 500));
  chromosome.add(meshTube(centralCurve, 0.039, blue, 500));
  const frames = centralCurve.computeFrenetFrames(600, true);
  for (let strand = 0; strand < 5; strand++) {
    const fibre = [];
    for (let j = 0; j < 600; j++) {
      const t = j / 600;
      const p = centralCurve.getPointAt(t);
      const a = t * Math.PI * 2 * 95 + strand * Math.PI * 2 / 5;
      const n = frames.normals[j], b = frames.binormals[j];
      fibre.push(p.addScaledVector(n, 0.042 * Math.cos(a))
                  .addScaledVector(b, 0.042 * Math.sin(a)));
    }
    chromosome.add(meshTube(path(fibre, true), 0.007,
      strand === 0 ? pink : ice, 750));
  }

  // FOUR real, three-dimensional, double-stranded circular plasmids.
  const plasmids = new T.Group();
  cell.add(plasmids);
  const locations = [
    [-1.22, 0.38, 0.30, 0.23],
    [-1.20, -0.34, -0.30, 0.20],
    [1.16, 0.34, -0.22, 0.21],
    [1.20, -0.35, 0.34, 0.24]
  ];
  locations.forEach(([x, y, z, radius], k) => {
    const ringGroup = new T.Group();
    ringGroup.position.set(x, y, z);
    ringGroup.rotation.set(0.4 + k * 0.3, 0.5 + k * 0.42, k * 0.7);
    for (let s = 0; s < 2; s++) {
      const pts = [];
      for (let i = 0; i < 190; i++) {
        const u = i / 190 * Math.PI * 2;
        const a = u * 20 + s * Math.PI;
        const r = radius + 0.018 * Math.cos(a);
        pts.push(new T.Vector3(r * Math.cos(u), r * Math.sin(u),
                               0.019 * Math.sin(a)));
      }
      ringGroup.add(meshTube(path(pts, true), 0.014,
        s === 0 ? gold : cream, 260));
    }
    plasmids.add(ringGroup);
  });

  // Thin 3D pili over the cylindrical surface AND rounded poles.
  let state = 77731;
  const rand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const count = 235;
  const hairs = new T.InstancedMesh(
    new T.CylinderGeometry(0.003, 0.010, 1, 5), aqua, count
  );
  const tips = new T.InstancedMesh(
    new T.SphereGeometry(0.012, 5, 4), cream, count
  );
  const obj = new T.Object3D();
  const unitY = new T.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const x = (rand() * 2 - 1) * (L / 2 + R * 0.96);
    const a = rand() * Math.PI * 2;
    const cap = Math.max(0, Math.abs(x) - L / 2);
    const rr = Math.sqrt(Math.max(0.001, R * R - cap * cap));
    const radial = new T.Vector3(0, Math.cos(a), Math.sin(a));
    const normal = new T.Vector3(
      Math.sign(x) * cap / R,
      radial.y * rr / R,
      radial.z * rr / R
    ).normalize();
    normal.add(new T.Vector3((rand() - 0.5) * 0.22,
                            (rand() - 0.5) * 0.15,
                            (rand() - 0.5) * 0.15)).normalize();
    const base = new T.Vector3(x, radial.y * rr, radial.z * rr);
    const len = 0.12 + rand() * 0.22;
    obj.position.copy(base).addScaledVector(normal, len / 2);
    obj.quaternion.setFromUnitVectors(unitY, normal);
    obj.scale.set(1, len, 1);
    obj.updateMatrix();
    hairs.setMatrixAt(i, obj.matrix);
    obj.position.copy(base).addScaledVector(normal, len);
    obj.quaternion.identity();
    obj.scale.setScalar(0.65 + rand() * 0.55);
    obj.updateMatrix();
    tips.setMatrixAt(i, obj.matrix);
  }
  hairs.instanceMatrix.needsUpdate = true;
  tips.instanceMatrix.needsUpdate = true;
  cell.add(hairs, tips);

  // FOUR luminous, spatially curved flagella, attached to the right pole.
  const flags = new T.Group();
  cell.add(flags);
  const flagColors = [aqua, cream, aqua, gold];
  for (let k = 0; k < 4; k++) {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const phase = k * 1.27;
      pts.push(new T.Vector3(
        L / 2 + R * 0.78 + t * (1.55 + 0.3 * k),
        0.23 * Math.sin(phase) + t * (0.30 + k * 0.12) +
          0.37 * t * Math.sin(t * Math.PI * 3.4 + phase),
        0.23 * Math.cos(phase) + 0.30 * t * Math.cos(t * Math.PI * 3 + phase)
      ));
    }
    flags.add(meshTube(path(pts), 0.019 - k * 0.002,
                       flagColors[k], 230));
    flags.add(meshTube(path(pts), 0.006, cream, 230));
  }



  // Second, smaller 3D bacterium in the background
  const distantTurner = new T.Group();
  scene.add(distantTurner);

  // Reuse the same complete 3D model
  const distantCell = cell.clone(true);
  distantTurner.add(distantCell);

  // Smaller and farther away
  distantTurner.scale.setScalar(0.44);
  distantTurner.position.set(-4, 4.35, -5.5);
  distantCell.rotation.z = 0.0;

  function moveDistantBacterium(t) {
    if (reduced) {
      distantTurner.position.x = -1.75;
      distantTurner.rotation.y = 0.5;
      distantTurner.rotation.x = -0.10;
      return;
    }

    const distanceToCamera =
      camera.position.z - distantTurner.position.z;

    const halfVisibleWidth =
      Math.tan(T.MathUtils.degToRad(camera.fov / 2)) *
      distanceToCamera * camera.aspect;

    const margin = 3.8;
    const left = -halfVisibleWidth - margin;
    const right = halfVisibleWidth + margin;

    // Alternate right-to-left and left-to-right journeys, 26 s each.
    const journey = t / 26 + 0.24;
    const leg = Math.floor(journey);
    const progress = journey - leg;
    const movingRight = leg % 2 === 1;

    distantTurner.position.x = movingRight
      ? left + progress * (right - left)
      : right - progress * (right - left);

    // Flagella remain behind the cell as it swims.
    distantTurner.rotation.y = movingRight ? Math.PI : 0;
    distantTurner.rotation.x = t * Math.PI * 2 / 6;
  }

  // A small conjugating pair in the background. The cells stay close while
  // the whole pair drifts gently; a luminous plasmid travels through the
  // connecting conjugation pilus from donor to recipient.
  const conjugationPair = new T.Group();
  scene.add(conjugationPair);
  conjugationPair.scale.setScalar(0.28);
  conjugationPair.position.set(0.25, -1.75, -5.2);

  const donor = new T.Group();
  donor.position.x = -0.98;
  donor.rotation.z = Math.PI; // Flagella point away from the transfer bridge.
  donor.add(cell.clone(true));
  conjugationPair.add(donor);

  const recipient = new T.Group();
  recipient.position.x = 0.98;
  recipient.add(cell.clone(true));
  conjugationPair.add(recipient);

  // The two bare cell poles meet through a flexible, glowing pilus.
  const transferCurve = path([
    new T.Vector3(-0.34, -0.071, 0.02),
    new T.Vector3(-0.21, -0.035, 0.10),
    new T.Vector3(0, 0.015, 0.15),
    new T.Vector3(0.21, 0.055, 0.10),
    new T.Vector3(0.34, 0.071, 0.02)
  ]);
  conjugationPair.add(meshTube(transferCurve, 0.033, filamentGlow, 100));
  conjugationPair.add(meshTube(transferCurve, 0.012, aqua, 100));

  // A double-ring plasmid acts as a visible particle moving along the pilus.
  const transferPlasmid = new T.Group();
  transferPlasmid.rotation.y = Math.PI / 2;
  const transferGlow = new T.Mesh(
    new T.TorusGeometry(0.13, 0.027, 8, 32),
    new T.MeshBasicMaterial({
      color: 0xffbc4a, transparent: true, opacity: 0.24,
      blending: T.AdditiveBlending, depthWrite: false
    })
  );
  const transferRing = new T.Mesh(
    new T.TorusGeometry(0.085, 0.012, 7, 28), gold
  );
  const transferRingSecond = new T.Mesh(
    new T.TorusGeometry(0.085, 0.009, 7, 28), cream
  );
  transferRingSecond.rotation.x = 0.18;
  transferPlasmid.add(transferGlow, transferRing, transferRingSecond);
  conjugationPair.add(transferPlasmid);

  function moveConjugatingPair(t) {
    // Slow, shared floating motion keeps the cells in contact.
    conjugationPair.position.x = 0.25 + 0.22 * Math.sin(t * 0.20);
    conjugationPair.position.y = -1.75 + 0.16 * Math.sin(t * 0.27 + 0.8);
    conjugationPair.rotation.z = 0.035 * Math.sin(t * 0.18);
    conjugationPair.rotation.y = 0.06 * Math.sin(t * 0.23);

    // One plasmid crosses the bridge every 7 seconds, donor to recipient.
    const progress = (t / 7) % 1;
    transferPlasmid.position.copy(transferCurve.getPointAt(progress));
    transferPlasmid.rotation.z = 0.25 * Math.sin(t * 1.1);
  }

  
  // THIRD BACTERIUM — swims diagonally upwards and re-enters at a
  // different random starting position after leaving the visible area.
  const thirdMover = new T.Group();
  scene.add(thirdMover);
  thirdMover.scale.setScalar(0.40);
  thirdMover.position.z = -4.8; // Behind the large bacterium

  const thirdHeading = new T.Group();
  thirdMover.add(thirdHeading);

  const thirdRoll = new T.Group();
  thirdHeading.add(thirdRoll);

  const thirdCell = cell.clone(true);
  thirdCell.rotation.set(0, 0, 0); // Long axis is now aligned with local X
  thirdRoll.add(thirdCell);

  const thirdTripSeconds = 14; // Faster diagonal journeys; lower number = faster
  let thirdTripIndex = -1;
  let thirdRoute;

  function moveThirdBacterium(t) {
    if (reduced) {
      thirdMover.position.set(-2.5, -2.0, -4.8);
      thirdHeading.rotation.z = Math.PI + 0.5;
      thirdRoll.rotation.x = 0.25;
      return;
    }

    const tripIndex = Math.floor(t / thirdTripSeconds);

    // A new route is selected only when the previous journey is finished.
    if (tripIndex !== thirdTripIndex) {
      thirdTripIndex = tripIndex;
      thirdRoute = {
        fromLeft: Math.random() < 0.65,
        toRight: Math.random() < 0.65,
        startSlot: 0.25 + Math.random() * 0.55,
        endSlot: 0.25 + Math.random() * 0.55
      };
    }

    // Compute the visible area at this cell's distance from the camera.
    const depth = camera.position.z - thirdMover.position.z;
    const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * depth;
    const halfWidth = halfHeight * camera.aspect;
    const margin = 2.6; // The whole bacterium goes off-screen before resetting

    // Random lower-left start: enter from the left OR bottom edge.
    const x0 = thirdRoute.fromLeft
      ? -halfWidth - margin
      : -halfWidth * thirdRoute.startSlot;
    const y0 = thirdRoute.fromLeft
      ? -halfHeight * thirdRoute.startSlot
      : -halfHeight - margin;

    // Random upper-right exit: leave at the right OR top edge.
    const x1 = thirdRoute.toRight
      ? halfWidth + margin
      : halfWidth * thirdRoute.endSlot;
    const y1 = thirdRoute.toRight
      ? halfHeight * thirdRoute.endSlot
      : halfHeight + margin;

    const progress = (t / thirdTripSeconds) % 1;
    thirdMover.position.x = x0 + (x1 - x0) * progress;
    thirdMover.position.y = y0 + (y1 - y0) * progress;

    // The flagella point backwards, opposite to the direction of travel.
    const travelAngle = Math.atan2(y1 - y0, x1 - x0);
    thirdHeading.rotation.z = travelAngle + Math.PI;

    // Spin the small cell around its own long axis (no flagellar undulation).
    thirdRoll.rotation.x = t * Math.PI * 2 / 11;
  }

  function resize() {
    const w = Math.max(1, mount.clientWidth);
    const h = Math.max(1, mount.clientHeight);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.85 ? 12 : 10.5;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(mount);
  } else window.addEventListener('resize', resize);

  // Mouse/touch rotation works in addition to automatic full turns.
  let pressed = false, px = 0, py = 0, dx = 0, dy = 0;
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', e => {
    pressed = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!pressed) return;
    dx += (e.clientX - px) * 0.009;
    dy = Math.max(-0.6, Math.min(0.6, dy + (e.clientY - py) * 0.006));
    px = e.clientX; py = e.clientY;
    if (reduced) draw(0);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type =>
    canvas.addEventListener(type, () => { pressed = false; }));

  const beginning = performance.now();
  function draw(time) {
    const t = (time - beginning) / 1000;
    turner.rotation.y = (reduced ? 0.36 : t * 2 * Math.PI / 12) + dx;
    turner.rotation.x = 0.13 + dy + (reduced ? 0 : 0.035 * Math.sin(t * 0.55));
      if (!reduced) {
      flags.rotation.y = 0.14 * Math.sin(t * 0.5);
      flags.rotation.z = 0.08 * Math.cos(t * 0.1);
      flags.rotation.x = 0.05 * Math.sin(t * 0.9);
    }

    moveDistantBacterium(t);
    moveThirdBacterium(t);
    moveConjugatingPair(t);
    renderer.render(scene, camera);
    mount.classList.add('is-ready');
  }
  function animate(time) {
    if (!document.hidden) draw(time);
    if (!reduced) requestAnimationFrame(animate);
  }
  draw(beginning);
  if (!reduced) requestAnimationFrame(animate);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    mount.classList.remove('is-ready');
    mount.classList.add('bacterium-fallback-only');
  });
}
