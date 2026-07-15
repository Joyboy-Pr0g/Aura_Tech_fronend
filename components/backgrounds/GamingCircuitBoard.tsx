'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  ScrollTracker,
  clamp,
  getOptimalPixelRatio,
  isMobileViewport,
  lerp,
  velocityToMultiplier,
} from '@/lib/utils/scrollCalculations';

interface CircuitPath {
  points: THREE.Vector3[];
}

interface PathSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

/** Generates a grid of interconnected circuit paths at varying depths */
function generateCircuitPaths(count: number, spread: number): CircuitPath[] {
  const paths: CircuitPath[] = [];
  const nodes: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      nodes.push(
        new THREE.Vector3(
          (i - count / 2) * spread + (Math.random() - 0.5) * 4,
          (j - count / 2) * spread + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 12,
        ),
      );
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const right = i + 1;
    const down = i + count;

    if (right < nodes.length && i % count !== count - 1 && Math.random() > 0.25) {
      paths.push({ points: [a.clone(), nodes[right].clone()] });
    }
    if (down < nodes.length && Math.random() > 0.25) {
      paths.push({ points: [a.clone(), nodes[down].clone()] });
    }
    if (Math.random() > 0.88) {
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (target !== a) {
        const mid = new THREE.Vector3().lerpVectors(a, target, 0.5);
        mid.z += (Math.random() - 0.5) * 6;
        paths.push({ points: [a.clone(), mid, target.clone()] });
      }
    }
  }

  return paths;
}

function collectJunctions(paths: CircuitPath[]): THREE.Vector3[] {
  const map = new Map<string, THREE.Vector3>();
  for (const path of paths) {
    for (const p of path.points) {
      const key = `${p.x.toFixed(1)}_${p.y.toFixed(1)}_${p.z.toFixed(1)}`;
      if (!map.has(key)) map.set(key, p.clone());
    }
  }
  return Array.from(map.values());
}

function buildPathSegments(curvePoints: THREE.Vector3[]): PathSegment[] {
  const segments: PathSegment[] = [];
  for (let i = 0; i < curvePoints.length - 1; i++) {
    segments.push({ start: curvePoints[i], end: curvePoints[i + 1] });
  }
  return segments;
}

const LINE_VERTEX = `
  attribute float aAlong;
  varying float vAlong;
  varying float vDepth;
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform float uGlowIntensity;
  uniform float uScrollDirection;

  void main() {
    vAlong = aAlong;
    vec3 pos = position;
    float flowDir = uScrollDirection;
    float pulse = sin(aAlong * 6.283 + uTime * (1.5 + abs(uScrollVelocity)) + flowDir * aAlong * 4.0) * 0.18;
    pos.z += pulse * (1.0 + uGlowIntensity * 0.5);
    pos.y += flowDir * uScrollVelocity * aAlong * 0.8;
    vDepth = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const LINE_FRAGMENT = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uGlowIntensity;
  uniform float uTime;
  uniform float uScrollDirection;
  varying float vAlong;
  varying float vDepth;

  void main() {
    float flow = vAlong - uTime * 0.25 * (1.0 + abs(uScrollDirection) * 2.0) * sign(uScrollDirection + 0.001);
    float wave = sin(flow * 12.0) * 0.5 + 0.5;
    vec3 color = mix(uColor2, uColor1, wave);
    float core = pow(wave, 2.0);
    float glow = (0.3 + core * 0.5) * (1.0 + uGlowIntensity * 2.0);
    float blur = smoothstep(0.0, 1.0, wave) * 0.15;
    float depthFade = clamp(1.0 - abs(vDepth) * 0.04, 0.15, 1.0);
    gl_FragColor = vec4(color + blur, glow * depthFade * 0.9);
  }
`;

const PARTICLE_VERTEX = `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uGlowIntensity;
  uniform float uScrollDirection;
  varying float vGlow;

  void main() {
    vGlow = 0.5 + 0.5 * sin(aPhase + uTime * 3.0 + uScrollDirection * 2.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float sizeBoost = 1.0 + uGlowIntensity * 0.6 + abs(uScrollDirection) * 0.4;
    gl_PointSize = aSize * sizeBoost * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uGlowIntensity;
  varying float vGlow;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float core = smoothstep(0.5, 0.0, dist);
    float trail = smoothstep(0.5, 0.15, dist);
    float alpha = (core * 0.9 + trail * 0.35) * vGlow * (0.6 + uGlowIntensity * 0.5);
    vec3 glow = uColor * (1.0 + core * 0.5);
    gl_FragColor = vec4(glow, alpha);
  }
`;

const NODE_VERTEX = `
  attribute float aPhase;
  attribute float aFlash;
  uniform float uTime;
  uniform float uGlowIntensity;
  varying float vFlash;
  varying float vPulse;

  void main() {
    vFlash = aFlash;
    float pulse = 0.75 + 0.25 * sin(aPhase + uTime * 2.0);
    float flash = step(0.97, fract(aPhase * 0.31 + uTime * 0.4));
    vPulse = pulse + flash * 0.35;
    vec3 scaled = position * vPulse * (1.0 + uGlowIntensity * 0.08);
    vec4 mvPosition = modelViewMatrix * vec4(scaled, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const NODE_FRAGMENT = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uGlowIntensity;
  uniform float uScrollDirection;
  varying float vFlash;
  varying float vPulse;

  void main() {
    float flash = step(0.97, fract(vFlash * 0.31)) * 0.9;
    vec3 color = mix(uColor2, uColor1, 0.45 + uScrollDirection * 0.2);
    float alpha = (0.4 + vPulse * 0.25 + uGlowIntensity * 0.3 + flash) * 0.85;
    gl_FragColor = vec4(color + vec3(flash * 0.25), alpha);
  }
`;

/**
 * Gaming circuit board 3D background — fixed full-page canvas.
 * Neon cyan lines, flowing particles, glowing nodes; scroll-responsive.
 */
export function GamingCircuitBoard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let disposed = false;
    let animationId = 0;
    let visible = true;

    const mobile = isMobileViewport();
    const particleCount = mobile ? 200 : 500;
    const gridSize = mobile ? 5 : 7;

    const scrollTracker = new ScrollTracker({ velocitySmoothing: 0.88 });
    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(getOptimalPixelRatio());

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0f0f, 0.028);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.z = 38;

    const color1 = new THREE.Color('#00D9FF');
    const color2 = new THREE.Color('#0066FF');
    const silver = new THREE.Color('#C0C0C0');

    const paths = generateCircuitPaths(gridSize, mobile ? 7 : 9);
    const junctions = collectJunctions(paths);

    const lineUniforms = {
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uScrollDirection: { value: 0 },
      uGlowIntensity: { value: 0.5 },
      uColor1: { value: color1 },
      uColor2: { value: color2 },
    };

    const lineMaterial = new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: LINE_VERTEX,
      fragmentShader: LINE_FRAGMENT,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineGroup = new THREE.Group();
    const pathSegments: PathSegment[] = [];

    paths.forEach((path) => {
      const curve = path.points.length === 2
        ? new THREE.LineCurve3(path.points[0], path.points[1])
        : new THREE.CatmullRomCurve3(path.points);
      const divisions = path.points.length === 2 ? 24 : 32;
      const curvePoints = curve.getPoints(divisions);
      pathSegments.push(...buildPathSegments(curvePoints));

      const positions: number[] = [];
      const along: number[] = [];
      curvePoints.forEach((pt, idx) => {
        positions.push(pt.x, pt.y, pt.z);
        along.push(idx / Math.max(curvePoints.length - 1, 1));
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));

      const line = new THREE.Line(geometry, lineMaterial);
      lineGroup.add(line);
    });
    scene.add(lineGroup);

    const nodeGeometry = new THREE.SphereGeometry(0.35, mobile ? 8 : 10, mobile ? 8 : 10);
    const nodePhases = new Float32Array(junctions.length);
    const nodeFlashes = new Float32Array(junctions.length);
    junctions.forEach((_, i) => {
      nodePhases[i] = Math.random() * Math.PI * 2;
      nodeFlashes[i] = Math.random();
    });
    nodeGeometry.setAttribute('aPhase', new THREE.BufferAttribute(nodePhases, 1));
    nodeGeometry.setAttribute('aFlash', new THREE.BufferAttribute(nodeFlashes, 1));

    const nodeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGlowIntensity: { value: 0.5 },
        uScrollDirection: { value: 0 },
        uColor1: { value: color1 },
        uColor2: { value: color2 },
      },
      vertexShader: NODE_VERTEX,
      fragmentShader: NODE_FRAGMENT,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodeMeshes: THREE.Mesh[] = [];
    junctions.forEach((pos, i) => {
      const geo = nodeGeometry.clone();
      geo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array([nodePhases[i]]), 1));
      geo.setAttribute('aFlash', new THREE.BufferAttribute(new Float32Array([nodeFlashes[i]]), 1));

      const mesh = new THREE.Mesh(geo, nodeMaterial.clone());
      mesh.position.copy(pos);
      mesh.scale.setScalar(0.8 + (nodeFlashes[i] % 1) * 0.6);
      scene.add(mesh);
      nodeMeshes.push(mesh);
    });

    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);
    const particleSegmentIndex = new Uint32Array(particleCount);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleSegmentIndex[i] = Math.floor(Math.random() * Math.max(pathSegments.length, 1));
      particleProgress[i] = Math.random();
      particleSpeed[i] = 0.12 + Math.random() * 0.28;
      particleSizes[i] = mobile ? 3.5 + Math.random() * 2 : 4 + Math.random() * 3;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(particlePhases, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uGlowIntensity: { value: 0.5 },
      uScrollDirection: { value: 0 },
      uColor: { value: color1 },
    };

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const silverAccents: THREE.Line[] = [];
    for (let i = 0; i < (mobile ? 4 : 8); i++) {
      const z = -8 - i * 2;
      const w = 30 + i * 3;
      const h = 18 + i * 2;
      const pts = [
        new THREE.Vector3(-w, -h, z),
        new THREE.Vector3(w, -h, z),
        new THREE.Vector3(w, h, z),
        new THREE.Vector3(-w, h, z),
        new THREE.Vector3(-w, -h, z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: silver,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
      });
      const frame = new THREE.Line(geo, mat);
      scene.add(frame);
      silverAccents.push(frame);
    }

    const clock = new THREE.Clock();

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setPixelRatio(getOptimalPixelRatio());
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onScroll = () => {
      scrollTracker.update(window.scrollY, performance.now());
    };

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };

    const animate = () => {
      if (disposed) return;
      animationId = requestAnimationFrame(animate);
      if (!visible) return;

      const elapsed = clock.getElapsedTime();
      const scroll = scrollTracker.tick(performance.now());
      const vel = velocityToMultiplier(scroll.velocity, 1.2);
      const direction = scroll.direction === 'down' ? 1 : scroll.direction === 'up' ? -1 : 0;
      const glow = clamp(0.35 + Math.abs(vel) * 0.85, 0.25, 1.9);
      const flowSign = direction !== 0 ? direction : 1;
      const idlePulse = 0.15 + Math.sin(elapsed * 0.8) * 0.05;

      lineUniforms.uTime.value = elapsed;
      lineUniforms.uScrollVelocity.value = vel;
      lineUniforms.uScrollDirection.value = direction !== 0 ? direction : idlePulse;
      lineUniforms.uGlowIntensity.value = glow;

      particleUniforms.uTime.value = elapsed;
      particleUniforms.uGlowIntensity.value = glow;
      particleUniforms.uScrollDirection.value = lineUniforms.uScrollDirection.value;

      nodeMeshes.forEach((mesh) => {
        const uniforms = (mesh.material as THREE.ShaderMaterial).uniforms;
        uniforms.uTime.value = elapsed;
        uniforms.uGlowIntensity.value = glow;
        uniforms.uScrollDirection.value = lineUniforms.uScrollDirection.value;
      });

      const parallaxY = -scroll.scrollY * 0.008 - vel * 4;
      lineGroup.position.y = parallaxY;
      lineGroup.rotation.z = vel * 0.004;

      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const baseSpeed = 0.006 * (1 + Math.abs(vel) * 0.8);
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] += particleSpeed[i] * baseSpeed * flowSign;
        if (particleProgress[i] > 1 || particleProgress[i] < 0) {
          particleProgress[i] = clamp(particleProgress[i], 0, 1);
          if (particleProgress[i] >= 1 || particleProgress[i] <= 0) {
            particleProgress[i] = flowSign > 0 ? 0 : 1;
            particleSegmentIndex[i] = Math.floor(Math.random() * Math.max(pathSegments.length, 1));
          }
        }
        const seg = pathSegments[particleSegmentIndex[i]];
        if (seg) {
          const t = particleProgress[i];
          posAttr.setXYZ(
            i,
            lerp(seg.start.x, seg.end.x, t),
            lerp(seg.start.y, seg.end.y, t) + parallaxY,
            lerp(seg.start.z, seg.end.z, t),
          );
        }
      }
      posAttr.needsUpdate = true;
      particles.position.y = -vel * 2;

      camera.position.y = -scroll.scrollY * 0.004 - vel * 2;
      camera.position.x = Math.sin(elapsed * 0.15) * 1.5;
      camera.rotation.z = vel * 0.002;

      silverAccents.forEach((frame, i) => {
        frame.rotation.z = elapsed * 0.02 * (i % 2 === 0 ? 1 : -1) + vel * 0.01;
      });

      renderer.render(scene, camera);
    };

    resize();
    scrollTracker.syncScrollY(window.scrollY);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    container.appendChild(renderer.domElement);
    animationId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);

      lineGroup.children.forEach((child) => {
        (child as THREE.Line).geometry.dispose();
      });
      lineMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      nodeMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      particleGeometry.dispose();
      particleMaterial.dispose();
      silverAccents.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    />
  );
}
