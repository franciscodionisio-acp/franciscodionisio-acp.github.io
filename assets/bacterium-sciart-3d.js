/*
 * Five luminous 3D bacterial cells.
 * Replace the entire assets/bacterium-sciart-3d.js file.
 */

const mount = document.querySelector('[data-bacterium-3d]');

if (mount) {
  loadThreeAndStart(mount);
}

async function loadThreeAndStart(mount) {
  const url =
    'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

  let THREE;
  let lastError;

  for (let attempt = 0; attempt < 4 && !THREE; attempt++) {
    try {
      THREE = await import(url);
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await new Promise(resolve =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  if (!THREE) {
    console.error('Could not load Three.js:', lastError);
    mount.classList.add('bacterium-fallback-only');
    return;
  }

  try {
    startBacterium(THREE, mount);
  } catch (error) {
    console.error('Could not start the bacterial scene:', error);
    mount.classList.add('bacterium-fallback-only');
  }
}

function startBacterium(T, mount) {
  const reduced =
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
   * CONJUGATING PAIR SETTINGS
   *
   * Increase separation to move the cells farther apart.
   * Increase floatSpeed to make their shared movement faster.
   * Decrease rotationSeconds to make each cell rotate faster.
   */
  const pairSettings = {
    separation: 7.2,
    scale: 0.28,
    depth: -5.2,
    floatSpeed: 0.85,
    floatWidth: 0.25,
    floatHeight: 0.20,
    rotationSeconds: 7,
    transferSeconds: 7
  };

  const scene = new T.Scene();

  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true
  });

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
  turner.position.x = -0.38;
  turner.scale.setScalar(0.80);
  scene.add(turner);

  const cell = new T.Group();
  cell.rotation.z = -0.38;
  turner.add(cell);

  const R = 0.93;
  const L = 3.05;
  const poleDistance = L / 2 + R;

  function capsule(radius, length, material) {
    const mesh = new T.Mesh(
      new T.CapsuleGeometry(radius, length, 18, 56),
      material
    );

    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  function path(points, closed = false) {
    return new T.CatmullRomCurve3(
      points,
      closed,
      'centripetal'
    );
  }

  function meshTube(curve, radius, material, steps = 160) {
    return new T.Mesh(
      new T.TubeGeometry(
        curve,
        steps,
        radius,
        7,
        curve.closed
      ),
      material
    );
  }

  // Black interior, with an almost invisible front membrane.
  const blackBack = capsule(
    R,
    L,
    new T.MeshBasicMaterial({
      color: 0x000000,
      side: T.BackSide,
      depthWrite: false
    })
  );

  blackBack.renderOrder = -20;
  cell.add(blackBack);

  const membrane = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: T.FrontSide,
    blending: T.AdditiveBlending,

    uniforms: {
      tint: { value: new T.Color(0x36f9e4) }
    },

    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vDirection;

      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vDirection = normalize(-p.xyz);
        gl_Position = projectionMatrix * p;
      }
    `,

    fragmentShader: `
      uniform vec3 tint;
      varying vec3 vNormalView;
      varying vec3 vDirection;

      void main() {
        float rim = pow(
          1.0 - abs(dot(
            normalize(vNormalView),
            normalize(vDirection)
          )),
          2.0
        );

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
    color: 0x376dff,
    transparent: true,
    opacity: 0.16,
    blending: T.AdditiveBlending,
    depthWrite: false
  });

  // One continuous fluorescent chromosome.
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

  chromosome.add(
    meshTube(centralCurve, 0.063, filamentGlow, 500),
    meshTube(centralCurve, 0.039, blue, 500)
  );

  const frames = centralCurve.computeFrenetFrames(600, true);

  for (let strand = 0; strand < 5; strand++) {
    const fibre = [];

    for (let j = 0; j < 600; j++) {
      const t = j / 600;
      const p = centralCurve.getPointAt(t);
      const a =
        t * Math.PI * 2 * 95 +
        strand * Math.PI * 2 / 5;

      fibre.push(
        p.addScaledVector(
          frames.normals[j],
          0.042 * Math.cos(a)
        ).addScaledVector(
          frames.binormals[j],
          0.042 * Math.sin(a)
        )
      );
    }

    chromosome.add(
      meshTube(
        path(fibre, true),
        0.007,
        strand === 0 ? pink : ice,
        750
      )
    );
  }

  // Four circular plasmids.
  const plasmids = new T.Group();
  cell.add(plasmids);

  const locations = [
    [-1.22,  0.38,  0.30, 0.23],
    [-1.20, -0.34, -0.30, 0.20],
    [ 1.16,  0.34, -0.22, 0.21],
    [ 1.20, -0.35,  0.34, 0.24]
  ];

  locations.forEach(([x, y, z, radius], k) => {
    const ringGroup = new T.Group();

    ringGroup.position.set(x, y, z);
    ringGroup.rotation.set(
      0.4 + k * 0.3,
      0.5 + k * 0.42,
      k * 0.7
    );

    for (let strand = 0; strand < 2; strand++) {
      const points = [];

      for (let i = 0; i < 190; i++) {
        const u = i / 190 * Math.PI * 2;
        const a = u * 20 + strand * Math.PI;
        const r = radius + 0.018 * Math.cos(a);

        points.push(new T.Vector3(
          r * Math.cos(u),
          r * Math.sin(u),
          0.019 * Math.sin(a)
        ));
      }

      ringGroup.add(
        meshTube(
          path(points, true),
          0.014,
          strand === 0 ? gold : cream,
          260
        )
      );
    }

    plasmids.add(ringGroup);
  });

  // Many thin surface pili.
  let state = 77731;

  const rand = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const count = 235;

  const hairs = new T.InstancedMesh(
    new T.CylinderGeometry(0.003, 0.010, 1, 5),
    aqua,
    count
  );

  const tips = new T.InstancedMesh(
    new T.SphereGeometry(0.012, 5, 4),
    cream,
    count
  );

  const obj = new T.Object3D();
  const unitY = new T.Vector3(0, 1, 0);

  for (let i = 0; i < count; i++) {
    const x = (rand() * 2 - 1) * (L / 2 + R * 0.96);
    const a = rand() * Math.PI * 2;
    const cap = Math.max(0, Math.abs(x) - L / 2);

    const rr = Math.sqrt(
      Math.max(0.001, R * R - cap * cap)
    );

    const radial = new T.Vector3(
      0,
      Math.cos(a),
      Math.sin(a)
    );

    const normal = new T.Vector3(
      Math.sign(x) * cap / R,
      radial.y * rr / R,
      radial.z * rr / R
    ).normalize();

    normal.add(new T.Vector3(
      (rand() - 0.5) * 0.22,
      (rand() - 0.5) * 0.15,
      (rand() - 0.5) * 0.15
    )).normalize();

    const base = new T.Vector3(
      x,
      radial.y * rr,
      radial.z * rr
    );

    const length = 0.12 + rand() * 0.22;

    obj.position.copy(base).addScaledVector(normal, length / 2);
    obj.quaternion.setFromUnitVectors(unitY, normal);
    obj.scale.set(1, length, 1);
    obj.updateMatrix();
    hairs.setMatrixAt(i, obj.matrix);

    obj.position.copy(base).addScaledVector(normal, length);
    obj.quaternion.identity();
    obj.scale.setScalar(0.65 + rand() * 0.55);
    obj.updateMatrix();
    tips.setMatrixAt(i, obj.matrix);
  }

  hairs.instanceMatrix.needsUpdate = true;
  tips.instanceMatrix.needsUpdate = true;
  cell.add(hairs, tips);

  // Four curved 3D flagella. They rotate with each cell without undulating.
  const flags = new T.Group();
  const flagColors = [aqua, cream, aqua, gold];
  cell.add(flags);

  for (let k = 0; k < 4; k++) {
    const points = [];

    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const phase = k * 1.27;

      points.push(new T.Vector3(
        L / 2 + R * 0.78 + t * (1.55 + 0.3 * k),

        0.23 * Math.sin(phase) +
        t * (0.30 + k * 0.12) +
        0.37 * t * Math.sin(t * Math.PI * 3.4 + phase),

        0.23 * Math.cos(phase) +
        0.30 * t * Math.cos(t * Math.PI * 3 + phase)
      ));
    }

    const curve = path(points);

    flags.add(
      meshTube(curve, 0.019 - k * 0.002, flagColors[k], 230),
      meshTube(curve, 0.006, cream, 230)
    );
  }

  // Second cell: alternating horizontal journeys.
  const distantTurner = new T.Group();
  const distantCell = cell.clone(true);

  distantCell.rotation.set(0, 0, 0);
  distantTurner.add(distantCell);
  distantTurner.scale.setScalar(0.44);
  distantTurner.position.set(-4, 4.35, -5.5);
  scene.add(distantTurner);

  function visibleBounds(z) {
    const depth = camera.position.z - z;
    const halfHeight =
      Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * depth;

    return {
      halfHeight,
      halfWidth: halfHeight * camera.aspect
    };
  }

  function moveDistantBacterium(t) {
    if (reduced) {
      distantTurner.position.x = -1.75;
      distantTurner.rotation.set(-0.10, 0.5, 0);
      return;
    }

    const { halfWidth } = visibleBounds(distantTurner.position.z);
    const left = -halfWidth - 3.8;
    const right = halfWidth + 3.8;

    const journey = t / 26 + 0.24;
    const leg = Math.floor(journey);
    const progress = journey - leg;
    const movingRight = leg % 2 === 1;

    distantTurner.position.x = movingRight
      ? left + progress * (right - left)
      : right - progress * (right - left);

    distantTurner.rotation.y = movingRight ? Math.PI : 0;
    distantCell.rotation.x = t * Math.PI * 2 / 6;
  }

  // Conjugating pair.
  const conjugationPair = new T.Group();
  conjugationPair.position.z = pairSettings.depth;
  scene.add(conjugationPair);

  const halfSeparation = pairSettings.separation / 2;

  const donor = new T.Group();
  donor.position.x = -halfSeparation;
  donor.rotation.z = Math.PI;

  const donorCell = cell.clone(true);
  donorCell.rotation.set(0, 0, 0);
  donor.add(donorCell);
  conjugationPair.add(donor);

  const recipient = new T.Group();
  recipient.position.x = halfSeparation;

  const recipientCell = cell.clone(true);
  recipientCell.rotation.set(0, 0, 0);
  recipient.add(recipientCell);
  conjugationPair.add(recipient);

  /*
   * Bridge endpoints are calculated from cell spacing.
   * Changing pairSettings.separation also changes the bridge length.
   * The endpoints lie on the long axes, so axial rotation keeps them attached.
   */
  const bridgeStart = -halfSeparation + poleDistance - 0.015;
  const bridgeEnd = halfSeparation - poleDistance + 0.015;

  const transferCurve = path([
    new T.Vector3(bridgeStart, 0, 0),
    new T.Vector3(bridgeStart * 0.5, 0.06, 0.10),
    new T.Vector3(0, 0.08, 0.14),
    new T.Vector3(bridgeEnd * 0.5, 0.06, 0.10),
    new T.Vector3(bridgeEnd, 0, 0)
  ]);

  const bridgeGlow = new T.MeshBasicMaterial({
    color: 0x57fff0,
    transparent: true,
    opacity: 0.18,
    blending: T.AdditiveBlending,
    depthWrite: false
  });

  conjugationPair.add(
    meshTube(transferCurve, 0.055, bridgeGlow, 100),
    meshTube(transferCurve, 0.023, aqua, 100)
  );

  // Stylised luminous plasmid-transfer indicator.
  const transferPlasmid = new T.Group();

  const transferGlow = new T.Mesh(
    new T.TorusGeometry(0.13, 0.027, 8, 32),
    new T.MeshBasicMaterial({
      color: 0xffbc4a,
      transparent: true,
      opacity: 0.24,
      blending: T.AdditiveBlending,
      depthWrite: false
    })
  );

  const transferRing = new T.Mesh(
    new T.TorusGeometry(0.085, 0.012, 7, 28),
    gold
  );

  const transferRingSecond = new T.Mesh(
    new T.TorusGeometry(0.085, 0.009, 7, 28),
    cream
  );

  transferRingSecond.rotation.x = 0.18;

  transferPlasmid.add(
    transferGlow,
    transferRing,
    transferRingSecond
  );

  conjugationPair.add(transferPlasmid);

  const pairAnchor = new T.Vector3();
  const ringNormal = new T.Vector3(0, 0, 1);

  function positionPairNearUpperLeft() {
    const { halfWidth, halfHeight } =
      visibleBounds(pairSettings.depth);

    // Reserve space for both cell bodies and their outward-facing flagella.
    const localHalfWidth = halfSeparation + 5.2;

    const scale = Math.min(
      pairSettings.scale,
      Math.max(0.03, (halfWidth - 0.50) / localHalfWidth)
    );

    conjugationPair.scale.setScalar(scale);

    const horizontalExtent = localHalfWidth * scale;

    pairAnchor.set(
      -halfWidth + horizontalExtent + 0.35,
      halfHeight - Math.max(0.55, 1.5 * scale + 0.10),
      pairSettings.depth
    );
  }

  function moveConjugatingPair(t) {
    const speed = pairSettings.floatSpeed;

    conjugationPair.position.set(
      pairAnchor.x +
        pairSettings.floatWidth * Math.sin(t * speed),

      pairAnchor.y +
        pairSettings.floatHeight * Math.sin(t * speed * 1.23),

      pairAnchor.z
    );

    // Gentle shared 3D rocking.
    conjugationPair.rotation.set(
      0.10 * Math.sin(t * 0.65),
      0.16 * Math.sin(t * 0.55),
      0.06 * Math.sin(t * 0.70)
    );

    // Faster axial rotation. The connecting poles remain in place.
    const spin = t * Math.PI * 2 / pairSettings.rotationSeconds;
    donorCell.rotation.x = spin;
    recipientCell.rotation.x = -spin * 0.90;

    const progress = (t / pairSettings.transferSeconds) % 1;

    transferPlasmid.position.copy(
      transferCurve.getPointAt(progress)
    );

    transferPlasmid.quaternion.setFromUnitVectors(
      ringNormal,
      transferCurve.getTangentAt(progress).normalize()
    );
  }

  // Third cell: random directions and diagonal angles.
  const thirdMover = new T.Group();
  thirdMover.scale.setScalar(0.40);
  thirdMover.position.z = -4.8;
  scene.add(thirdMover);

  const thirdHeading = new T.Group();
  const thirdRoll = new T.Group();
  const thirdCell = cell.clone(true);

  thirdCell.rotation.set(0, 0, 0);
  thirdMover.add(thirdHeading);
  thirdHeading.add(thirdRoll);
  thirdRoll.add(thirdCell);

  const thirdTripSeconds = 14;
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

    if (tripIndex !== thirdTripIndex) {
      thirdTripIndex = tripIndex;

      const direction = Math.random() < 0.5 ? 1 : -1;
      const slope =
        (0.15 + Math.random() * 0.85) *
        (Math.random() < 0.5 ? 1 : -1);

      thirdRoute = {
        direction,
        slope,
        offset: (Math.random() - 0.5) * 0.7
      };
    }

    const { halfWidth, halfHeight } =
      visibleBounds(thirdMover.position.z);

    const extent = Math.max(
      halfWidth + 2.6,
      (halfHeight + 2.6) / Math.abs(thirdRoute.slope)
    );

    const progress = (t / thirdTripSeconds) % 1;

    const x0 = -extent * thirdRoute.direction;
    const x1 = extent * thirdRoute.direction;

    const x = x0 + (x1 - x0) * progress;
    const y =
      thirdRoute.slope * x +
      thirdRoute.offset * halfHeight;

    thirdMover.position.x = x;
    thirdMover.position.y = y;

    const angle = Math.atan2(
      thirdRoute.slope * thirdRoute.direction,
      thirdRoute.direction
    );

    thirdHeading.rotation.z = angle + Math.PI;
    thirdRoll.rotation.x = t * Math.PI * 2 / 11;
  }

  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);

    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.85 ? 12 : 10.5;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
    positionPairNearUpperLeft();
  }

  resize();

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(mount);
  } else {
    window.addEventListener('resize', resize);
  }

  const canvas = renderer.domElement;
  let pressed = false;
  let px = 0;
  let py = 0;
  let dx = 0;
  let dy = 0;

  canvas.addEventListener('pointerdown', event => {
    pressed = true;
    px = event.clientX;
    py = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', event => {
    if (!pressed) return;

    dx += (event.clientX - px) * 0.009;
    dy = Math.max(
      -0.6,
      Math.min(0.6, dy + (event.clientY - py) * 0.006)
    );

    px = event.clientX;
    py = event.clientY;

    if (reduced) draw(performance.now());
  });

  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(
    type => canvas.addEventListener(type, () => {
      pressed = false;
    })
  );

  const beginning = performance.now();
  let contextLost = false;
  let frameErrorReported = false;

  function draw(time) {
    if (contextLost) return;

    const t = reduced
      ? 0
      : Math.max(0, (time - beginning) / 1000);

    turner.rotation.y =
      (reduced ? 0.36 : t * Math.PI * 2 / 12) + dx;

    turner.rotation.x =
      0.13 + dy +
      (reduced ? 0 : 0.035 * Math.sin(t * 0.55));

    moveDistantBacterium(t);
    moveThirdBacterium(t);
    moveConjugatingPair(t);

    renderer.render(scene, camera);

    mount.classList.add('is-ready');
    mount.classList.remove('bacterium-fallback-only');
  }

  function safeDraw(time) {
    try {
      draw(time);
      frameErrorReported = false;
    } catch (error) {
      if (!frameErrorReported) {
        console.error('Bacterial animation frame failed:', error);
        frameErrorReported = true;
      }
    }
  }

  function animate(time) {
    requestAnimationFrame(animate);

    if (!document.hidden) {
      safeDraw(time);
    }
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    mount.classList.remove('is-ready');
  });

  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    safeDraw(performance.now());
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resize();
      safeDraw(performance.now());
    }
  });

  safeDraw(beginning);

  if (!reduced) {
    requestAnimationFrame(animate);
  }
}
