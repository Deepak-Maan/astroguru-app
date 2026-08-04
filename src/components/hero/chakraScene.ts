/**
 * The Rashi Chakra scene.
 *
 * The ecliptic is rendered as a brass band seen almost edge-on, the way the
 * zodiac actually lies across the sky. On it sit the twelve rashi notches
 * (which, in whole-sign houses, are also the bhava cusps), twenty-seven finer
 * nakshatra ticks, and the nine grahas at their real computed longitudes.
 * A single vertical shaft marks the lagna, because the ascendant is literally
 * the degree rising on the eastern horizon.
 *
 * Everything here is pure three.js with no React and no image assets — geometry
 * and shaders only, so it behaves the same in Expo Go and in the browser.
 *
 * The scene exposes a small set of animatable handles; `RashiChakra` drives
 * them with GSAP. Nothing in this file animates itself.
 */
import * as THREE from 'three';
import { Kundli } from '../../types';
import { AURORA, BRASS, NAVAGRAHA } from './navagraha';

/** Radius of the ecliptic band centre line, in scene units. */
const R = 1.62;
const BAND_INNER = R - 0.13;
const BAND_OUTER = R + 0.13;

/** Longitude (degrees) → position on the ecliptic plane. */
function onEcliptic(lonDeg: number, radius: number, y = 0): THREE.Vector3 {
  const a = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(radius * Math.cos(a), y, -radius * Math.sin(a));
}

/** A uniform holding a single animatable number. GSAP tweens `.value`. */
type NumUniform = { value: number };

export interface ChakraHandles {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Rotated by drag and by the ambient drift. */
  spin: THREE.Group;

  /** 0 → 1 sweeps the brass band into existence, starting at the lagna. */
  bandReveal: NumUniform;
  /** 0 → 1 staggers the twelve rashi notches outward. */
  notchReveal: NumUniform;
  /** 0 → 1 staggers the twenty-seven nakshatra ticks. */
  tickReveal: NumUniform;
  /** 0 → 1 flies the nine grahas inward, in navagraha order. */
  grahaReveal: NumUniform;
  /** 0 → 1 raises the lagna shaft. */
  beamReveal: NumUniform;
  /** 0 → 1 fades the starfield up. */
  starOpacity: NumUniform;

  /** Advances continuously; drives the graha shimmer. */
  time: NumUniform;

  setSize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}

/* -------------------------------------------------------------------------- */
/* Geometry builders                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A set of radial bars lying in the ecliptic plane — used for both the rashi
 * notches and the nakshatra ticks.
 *
 * Each bar carries its own centre point and sequence index so the vertex shader
 * can grow it out from the band and stagger the group without one draw call per
 * bar.
 */
function buildBars(
  angles: number[],
  innerR: number,
  outerR: number,
  halfWidth: number,
): THREE.BufferGeometry {
  const position: number[] = [];
  const center: number[] = [];
  const index: number[] = [];
  const indices: number[] = [];

  angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const hw = halfWidth;
    const corners: Array<[number, number]> = [
      [innerR, a - hw],
      [outerR, a - hw],
      [outerR, a + hw],
      [innerR, a + hw],
    ];
    const mid = onEcliptic(deg, (innerR + outerR) / 2);
    const base = i * 4;

    for (const [r, ang] of corners) {
      position.push(r * Math.cos(ang), 0, -r * Math.sin(ang));
      center.push(mid.x, mid.y, mid.z);
      index.push(i);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  g.setAttribute('aCenter', new THREE.Float32BufferAttribute(center, 3));
  g.setAttribute('aIndex', new THREE.Float32BufferAttribute(index, 1));
  g.setIndex(indices);
  return g;
}

/** Shared shader for the staggered bar groups. */
function barMaterial(
  count: number,
  color: [number, number, number],
  reveal: NumUniform,
  opacity: number,
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uReveal: reveal,
      uColor: { value: new THREE.Vector3(...color) },
      uCount: { value: count },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      precision mediump float;
      attribute vec3 aCenter;
      attribute float aIndex;
      uniform float uReveal;
      uniform float uCount;
      varying float vLocal;

      void main() {
        // Each bar gets its own slice of the 0..1 reveal, so one tween
        // produces an ordered cascade.
        float local = clamp(uReveal * uCount - aIndex, 0.0, 1.0);
        local = smoothstep(0.0, 1.0, local);
        vLocal = local;
        vec3 p = aCenter + (position - aCenter) * local;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vLocal;

      void main() {
        gl_FragColor = vec4(uColor, vLocal * uOpacity);
      }
    `,
  });
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                       */
/* -------------------------------------------------------------------------- */

export function createChakra(kundli: Kundli | null): ChakraHandles {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  // Low and close: the band reads as a band, not a disc.
  camera.position.set(0, 1.02, 3.55);
  camera.lookAt(0, -0.04, 0);

  const spin = new THREE.Group();
  scene.add(spin);

  const bandReveal: NumUniform = { value: 0 };
  const notchReveal: NumUniform = { value: 0 };
  const tickReveal: NumUniform = { value: 0 };
  const grahaReveal: NumUniform = { value: 0 };
  const beamReveal: NumUniform = { value: 0 };
  const starOpacity: NumUniform = { value: 0 };
  const time: NumUniform = { value: 0 };

  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  // The sweep starts at the lagna, so the chart draws itself from the
  // ascendant the way a chart is actually cast.
  const lagnaLon = kundli?.lagnaLongitude ?? 0;

  /* -- Starfield --------------------------------------------------------- */
  {
    const COUNT = 420;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Deterministic scatter — the same sky every launch.
      const t = i * 0.61803398875;
      const theta = t * Math.PI * 2;
      const phi = Math.acos(1 - 2 * ((i + 0.5) / COUNT));
      const r = 9 + ((i * 7919) % 1000) / 1000 * 13;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Mostly cold violet-white, with the occasional brass ember.
      const warm = (i * 37) % 11 === 0;
      const c = warm ? BRASS.bright : [0.86, 0.83, 1.0];
      const dim = 0.45 + ((i * 5077) % 100) / 100 * 0.55;
      col[i * 3] = c[0] * dim;
      col[i * 3 + 1] = c[1] * dim;
      col[i * 3 + 2] = c[2] * dim;
      siz[i] = warm ? 3.0 : 1.6 + ((i * 3121) % 100) / 100 * 1.4;
    }

    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));

    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uOpacity: starOpacity, uPixelRatio: { value: 1 } },
        vertexShader: /* glsl */ `
          precision mediump float;
          attribute vec3 aColor;
          attribute float aSize;
          uniform float uPixelRatio;
          varying vec3 vColor;
          void main() {
            vColor = aColor;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uPixelRatio;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uOpacity;
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.06, d);
            gl_FragColor = vec4(vColor, a * uOpacity);
          }
        `,
      }),
    );

    const stars = new THREE.Points(g, m);
    stars.name = 'stars';
    scene.add(stars);
  }

  /* -- The brass ecliptic band ------------------------------------------- */
  {
    const g = track(new THREE.RingGeometry(BAND_INNER, BAND_OUTER, 256, 1));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uReveal: bandReveal,
          uStart: { value: (lagnaLon * Math.PI) / 180 },
          uBase: { value: new THREE.Vector3(...BRASS.base) },
          uBright: { value: new THREE.Vector3(...BRASS.bright) },
          uInner: { value: BAND_INNER },
          uOuter: { value: BAND_OUTER },
        },
        vertexShader: /* glsl */ `
          precision mediump float;
          varying float vAngle;
          varying float vRadial;
          uniform float uInner;
          uniform float uOuter;
          void main() {
            // RingGeometry lives in local XY; the mesh is rotated into the
            // ecliptic plane, so the local angle is the ecliptic longitude.
            vAngle = atan(position.y, position.x);
            vRadial = (length(position.xy) - uInner) / (uOuter - uInner);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          #define TAU 6.28318530718
          uniform float uReveal;
          uniform float uStart;
          uniform vec3 uBase;
          uniform vec3 uBright;
          varying float vAngle;
          varying float vRadial;

          void main() {
            // Sweep anticlockwise from the lagna.
            float swept = mod(vAngle - uStart, TAU) / TAU;
            float on = smoothstep(0.0, 0.035, uReveal - swept);
            if (uReveal >= 1.0) on = 1.0;

            // Soft edges so the band glows rather than cuts.
            float edge = sin(vRadial * 3.14159265);
            edge = pow(clamp(edge, 0.0, 1.0), 1.5);

            // A slow specular travelling round the metal.
            float sheen = 0.55 + 0.45 * pow(max(sin(vAngle * 1.5), 0.0), 6.0);
            vec3 col = mix(uBase, uBright, sheen * 0.55);

            // The leading edge burns brighter as it draws.
            float head = smoothstep(0.06, 0.0, uReveal - swept) * step(swept, uReveal);
            col += uBright * head * 1.6;

            gl_FragColor = vec4(col, on * edge * 0.85);
          }
        `,
      }),
    );

    const band = new THREE.Mesh(g, m);
    band.rotation.x = -Math.PI / 2;
    spin.add(band);
  }

  /* -- Twelve rashi notches (= whole-sign bhava cusps) -------------------- */
  {
    // Boundaries fall on the sign edges, offset so the lagna's own cusp leads.
    const startDeg = Math.floor(lagnaLon / 30) * 30;
    const angles = Array.from({ length: 12 }, (_, i) => startDeg + i * 30);
    const g = track(buildBars(angles, BAND_INNER - 0.1, BAND_OUTER + 0.1, 0.0045));
    const m = track(barMaterial(12, BRASS.bright, notchReveal, 0.9));
    const notches = new THREE.Mesh(g, m);
    notches.rotation.x = 0; // bars are already built in the ecliptic plane
    spin.add(notches);
  }

  /* -- Twenty-seven nakshatra ticks --------------------------------------- */
  {
    const angles = Array.from({ length: 27 }, (_, i) => i * (360 / 27));
    const g = track(buildBars(angles, BAND_INNER - 0.055, BAND_INNER + 0.01, 0.0028));
    const m = track(barMaterial(27, BRASS.base, tickReveal, 0.75));
    spin.add(new THREE.Mesh(g, m));
  }

  /* -- The nine grahas ----------------------------------------------------- */
  if (kundli) {
    const planets = [...kundli.planets].sort(
      (a, b) => NAVAGRAHA[a.key].order - NAVAGRAHA[b.key].order,
    );
    const n = planets.length;

    const pos = new Float32Array(n * 3);
    const from = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const siz = new Float32Array(n);
    const ord = new Float32Array(n);

    planets.forEach((p, i) => {
      const style = NAVAGRAHA[p.key];
      // Grahas ride slightly above the band so they read as points of light
      // sitting on it rather than embedded in it.
      const target = onEcliptic(p.longitude, R, 0.052);
      // They arrive from far out along their own radius.
      const origin = onEcliptic(p.longitude, R * 3.4, 0.9);

      pos.set([target.x, target.y, target.z], i * 3);
      from.set([origin.x, origin.y, origin.z], i * 3);
      col.set(style.rgb, i * 3);
      siz[i] = style.size;
      ord[i] = style.order;
    });

    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
    g.setAttribute('aOrder', new THREE.BufferAttribute(ord, 1));

    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uReveal: grahaReveal,
          uTime: time,
          uPixelRatio: { value: 1 },
          uBase: { value: 46 },
        },
        vertexShader: /* glsl */ `
          precision mediump float;
          attribute vec3 aFrom;
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aOrder;
          uniform float uReveal;
          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uBase;
          varying vec3 vColor;
          varying float vLocal;

          void main() {
            // Nine slices of the reveal — the cascade follows the canonical
            // navagraha order carried in aOrder.
            float local = clamp(uReveal * 9.0 - aOrder, 0.0, 1.0);
            // Decelerating arrival.
            float eased = 1.0 - pow(1.0 - local, 3.0);
            vLocal = local;
            vColor = aColor;

            vec3 p = mix(aFrom, position, eased);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);

            // Gentle breathing, phase-offset per graha.
            float pulse = 0.9 + 0.1 * sin(uTime * 1.7 + aOrder * 1.9);
            // Perspective-correct sizing so far grahas recede.
            gl_PointSize = uBase * aSize * eased * pulse * uPixelRatio / -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          varying vec3 vColor;
          varying float vLocal;

          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            // A hot core inside a wide soft halo.
            float core = smoothstep(0.32, 0.0, d);
            float halo = smoothstep(1.0, 0.18, d) * 0.42;
            float a = clamp(core + halo, 0.0, 1.0) * vLocal;
            vec3 col = mix(vColor, vec3(1.0), core * 0.65);
            gl_FragColor = vec4(col, a);
          }
        `,
      }),
    );

    const grahas = new THREE.Points(g, m);
    grahas.name = 'grahas';
    spin.add(grahas);
  }

  /* -- The lagna shaft ----------------------------------------------------- */
  {
    const H = 1.25;
    const g = track(new THREE.CylinderGeometry(0.014, 0.03, H, 12, 1, true));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uReveal: beamReveal,
          uHalf: { value: H / 2 },
          uWarm: { value: new THREE.Vector3(...BRASS.bright) },
          uCool: { value: new THREE.Vector3(...AURORA) },
        },
        vertexShader: /* glsl */ `
          precision mediump float;
          varying float vY;
          uniform float uReveal;
          uniform float uHalf;
          void main() {
            // The cylinder is centred on its own origin (y in [-uHalf, uHalf]).
            // Pin the base and let the tip climb with the reveal.
            vec3 p = position;
            p.y = -uHalf + (position.y + uHalf) * uReveal;
            // Normalised height, 0 at the horizon end, 1 at the tip.
            vY = (position.y + uHalf) / (2.0 * uHalf);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uReveal;
          uniform vec3 uWarm;
          uniform vec3 uCool;
          varying float vY;
          void main() {
            // Brass at the horizon, cooling to violet as it climbs, gone at the top.
            float fade = pow(1.0 - vY, 1.6);
            vec3 col = mix(uWarm, uCool, vY);
            gl_FragColor = vec4(col, fade * 0.55 * uReveal);
          }
        `,
      }),
    );

    const beam = new THREE.Mesh(g, m);
    const at = onEcliptic(lagnaLon, R);
    beam.position.set(at.x, H / 2, at.z);
    spin.add(beam);
  }

  /* -- Bindu: the still point at the centre --------------------------------- */
  {
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uReveal: bandReveal,
          uPixelRatio: { value: 1 },
          uColor: { value: new THREE.Vector3(...BRASS.bright) },
        },
        vertexShader: /* glsl */ `
          precision mediump float;
          uniform float uPixelRatio;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 26.0 * uPixelRatio;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uReveal;
          uniform vec3 uColor;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float a = smoothstep(1.0, 0.0, d);
            gl_FragColor = vec4(uColor, a * a * 0.5 * uReveal);
          }
        `,
      }),
    );
    spin.add(new THREE.Points(g, m));
  }

  /* -- Handles -------------------------------------------------------------- */

  /** Point materials size themselves in device pixels, so they need the ratio. */
  function applyPixelRatio(ratio: number) {
    scene.traverse((o) => {
      const mat = (o as THREE.Points).material as THREE.ShaderMaterial | undefined;
      if (mat && 'uniforms' in mat && mat.uniforms.uPixelRatio) {
        mat.uniforms.uPixelRatio.value = ratio;
      }
    });
  }

  return {
    scene,
    camera,
    spin,
    bandReveal,
    notchReveal,
    tickReveal,
    grahaReveal,
    beamReveal,
    starOpacity,
    time,

    setSize(width, height, pixelRatio) {
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      applyPixelRatio(pixelRatio);
    },

    dispose() {
      for (const d of disposables) d.dispose();
      scene.clear();
    },
  };
}
