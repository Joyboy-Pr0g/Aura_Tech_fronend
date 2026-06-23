'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as THREE from 'three';
import {
  ScrollTracker,
  ScrollState,
  clamp,
  getOptimalPixelRatio,
  isMobileViewport,
  lerp,
  velocityToMultiplier,
} from '@/lib/utils/scrollCalculations';

export type BackgroundVariant = 'particles' | 'wave' | 'aurora';

export interface ScrollResponsiveBackgroundProps {
  /** Scene variant to render */
  variant?: BackgroundVariant;
  /** Primary neon color (cyan) */
  color1?: string;
  /** Secondary electric blue */
  color2?: string;
  /** Metallic accent */
  color3?: string;
  /** Scroll responsiveness multiplier (0.5–2) */
  scrollSensitivity?: number;
  /** Desktop particle count (mobile auto-reduces) */
  particleCount?: number;
  /** Overall effect intensity (0.5–2) */
  intensity?: number;
}

interface SceneController {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (scroll: ScrollState, elapsed: number, delta: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

interface SceneConfig {
  color1: string;
  color2: string;
  color3: string;
  particleCount: number;
  intensity: number;
  scrollSensitivity: number;
  mobile: boolean;
}

const HIDDEN_ROUTES = ['/dashboard', '/admin', '/login', '/register'];

/** Routes where the 3D canvas should not render */
function shouldHideBackground(pathname: string): boolean {
  return HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Creates a particle field with neon glow, responsive to scroll velocity.
 */
function createParticleScene(config: SceneConfig): SceneController {
  const { color1, color2, intensity, mobile } = config;
  const count = mobile ? Math.min(config.particleCount, 200) : config.particleCount;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f0f0f, 0.035);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  camera.position.z = 28;

  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const mixes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    scales[i] = Math.random() * 2 + 0.5;
    mixes[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aMix', new THREE.BufferAttribute(mixes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uOpacity: { value: 0.55 * intensity },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      attribute float aScale;
      attribute float aMix;
      uniform float uTime;
      uniform float uScrollVelocity;
      uniform float uPixelRatio;
      varying float vMix;
      varying float vAlpha;

      void main() {
        vMix = aMix;
        vec3 pos = position;
        pos.y += sin(uTime * 0.4 + pos.x * 0.08) * 0.6;
        pos.x += cos(uTime * 0.3 + pos.z * 0.06) * 0.4;
        pos.y -= uScrollVelocity * 12.0;
        pos.z += uScrollVelocity * 6.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aScale * (48.0 * uPixelRatio) * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 0.5 + abs(uScrollVelocity) * 8.0;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uOpacity;
      varying float vMix;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        if (dist > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 1.8);
        vec3 color = mix(uColor1, uColor2, vMix);
        float alpha = glow * uOpacity * clamp(vAlpha, 0.35, 0.95);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    scene,
    camera,
    update(scroll, elapsed, delta) {
      const vel = velocityToMultiplier(scroll.velocity, config.scrollSensitivity);
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uScrollVelocity.value = vel;
      material.uniforms.uOpacity.value = lerp(
        0.4 * intensity,
        0.8 * intensity,
        clamp(Math.abs(vel) * 0.5, 0, 1),
      );

      points.rotation.x += vel * 0.001 + delta * 0.02;
      points.rotation.y += vel * 0.002 + delta * 0.015;
      points.rotation.z += vel * 0.0005;

      camera.position.y = lerp(camera.position.y, -scroll.progress * 6 + vel * 2, 0.05);
      camera.position.z = clamp(28 - vel * 4 - scroll.progress * 4, 18, 32);
      camera.lookAt(0, 0, 0);
    },
    resize(width, height) {
      // camera aspect updated externally
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Creates a shader-driven wave plane that flows with scroll.
 */
function createWaveScene(config: SceneConfig): SceneController {
  const { color1, color2, intensity } = config;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f0f0f, 0.04);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 12, 32);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.PlaneGeometry(120, 80, config.mobile ? 64 : 128, config.mobile ? 48 : 96);
  geometry.rotateX(-Math.PI * 0.42);

  const material = new THREE.ShaderMaterial({
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uScrollY: { value: 0 },
      uScrollVelocity: { value: 0 },
      uProgress: { value: 0 },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uIntensity: { value: intensity },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uScrollVelocity;
      uniform float uScrollY;
      varying float vElevation;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave1 = sin(pos.x * 0.15 + uTime * 0.8) * 1.2;
        float wave2 = cos(pos.y * 0.12 + uTime * 0.6) * 0.8;
        float scrollWave = sin(pos.x * 0.05 + uScrollY * 0.01) * 2.0;
        float amp = 1.0 + abs(uScrollVelocity) * 4.0;
        pos.z += (wave1 + wave2 + scrollWave) * amp;
        pos.y += uScrollVelocity * 8.0;
        vElevation = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uProgress;
      uniform float uIntensity;
      varying float vElevation;
      varying vec2 vUv;

      void main() {
        vec3 color = mix(uColor1, uColor2, clamp(uProgress + vElevation * 0.08, 0.0, 1.0));
        float alpha = (0.12 + abs(vElevation) * 0.06) * uIntensity;
        gl_FragColor = vec4(color, clamp(alpha, 0.05, 0.45));
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    scene,
    camera,
    update(scroll, elapsed) {
      const vel = velocityToMultiplier(scroll.velocity, config.scrollSensitivity);
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uScrollY.value = scroll.scrollY;
      material.uniforms.uScrollVelocity.value = vel;
      material.uniforms.uProgress.value = scroll.progress;

      mesh.rotation.z = vel * 0.008;
      camera.position.y = 12 - scroll.progress * 8 - vel * 3;
    },
    resize() {},
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * Creates soft aurora orbs that drift with scroll direction.
 */
function createAuroraScene(config: SceneConfig): SceneController {
  const { color1, color2, color3, intensity, mobile } = config;
  const orbCount = mobile ? 4 : 7;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f0f0f, 0.025);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 150);
  camera.position.z = 40;

  const orbs: THREE.Mesh[] = [];
  const basePositions: THREE.Vector3[] = [];

  for (let i = 0; i < orbCount; i++) {
    const radius = 4 + Math.random() * 8;
    const geometry = new THREE.SphereGeometry(radius, mobile ? 16 : 24, mobile ? 16 : 24);
    const t = i / Math.max(orbCount - 1, 1);
    const color = new THREE.Color().lerpColors(
      new THREE.Color(color1),
      new THREE.Color(i % 2 === 0 ? color2 : color3),
      t,
    );

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08 * intensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20 - 10,
    );
    mesh.position.copy(pos);
    basePositions.push(pos.clone());
    scene.add(mesh);
    orbs.push(mesh);
  }

  return {
    scene,
    camera,
    update(scroll, elapsed) {
      const vel = velocityToMultiplier(scroll.velocity, config.scrollSensitivity);

      orbs.forEach((orb, i) => {
        const base = basePositions[i];
        const drift = Math.sin(elapsed * 0.3 + i) * 2;
        orb.position.x = base.x + drift;
        orb.position.y = base.y - scroll.scrollY * 0.015 - vel * 6;
        orb.position.z = base.z + scroll.progress * 10;

        const mat = orb.material as THREE.MeshBasicMaterial;
        mat.opacity = lerp(0.06, 0.18, clamp(scroll.progress + Math.abs(vel) * 0.3, 0, 1)) * intensity;
      });

      camera.position.y = -scroll.progress * 5 - vel * 2;
      camera.rotation.z = vel * 0.003;
    },
    resize() {},
    dispose() {
      orbs.forEach((orb) => {
        orb.geometry.dispose();
        (orb.material as THREE.Material).dispose();
      });
    },
  };
}

function createScene(variant: BackgroundVariant, config: SceneConfig): SceneController {
  switch (variant) {
    case 'wave':
      return createWaveScene(config);
    case 'aurora':
      return createAuroraScene(config);
    case 'particles':
    default:
      return createParticleScene(config);
  }
}

/**
 * Scroll-responsive Three.js background for AURA TECH.
 * Renders a fixed canvas behind page content with particle, wave, or aurora scenes.
 */
export function ScrollResponsiveBackground({
  variant = 'particles',
  color1 = '#00D9FF',
  color2 = '#0066FF',
  color3 = '#C0C0C0',
  scrollSensitivity = 1,
  particleCount = 500,
  intensity = 1,
}: ScrollResponsiveBackgroundProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const hidden = shouldHideBackground(pathname);

  useEffect(() => {
    if (hidden) return;

    const container = containerRef.current;
    if (!container) return;

    let animationId = 0;
    let disposed = false;

    const scrollTracker = new ScrollTracker();
    let scrollState: ScrollState = {
      scrollY: 0,
      velocity: 0,
      direction: 'idle',
      progress: 0,
    };

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileViewport(),
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x0f0f0f, 1);
    renderer.setPixelRatio(getOptimalPixelRatio());
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const mobile = isMobileViewport();
    const sceneConfig: SceneConfig = {
      color1,
      color2,
      color3,
      particleCount,
      intensity: clamp(intensity, 0.5, 2),
      scrollSensitivity: clamp(scrollSensitivity, 0.5, 2),
      mobile,
    };

    let controller = createScene(variant, sceneConfig);

    const clock = new THREE.Clock();
    let lastFrame = 0;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      renderer.setPixelRatio(getOptimalPixelRatio());
      renderer.setSize(width, height, false);
      controller.camera.aspect = width / height;
      controller.camera.updateProjectionMatrix();
      controller.resize(width, height);
    };

    const onScroll = () => {
      scrollState = scrollTracker.update(window.scrollY, performance.now());
    };

    const animate = (timestamp: number) => {
      if (disposed) return;
      animationId = requestAnimationFrame(animate);

      const delta = lastFrame ? (timestamp - lastFrame) / 1000 : 0;
      lastFrame = timestamp;

      scrollState = scrollTracker.tick(timestamp);
      const elapsed = clock.getElapsedTime();

      controller.update(scrollState, elapsed, delta);
      renderer.render(controller.scene, controller.camera);

      if (!readyRef.current) {
        readyRef.current = true;
        setIsReady(true);
      }
    };

    resize();
    scrollTracker.syncScrollY(window.scrollY);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    animationId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      controller.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hidden, variant, color1, color2, color3, scrollSensitivity, particleCount, intensity]);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0F0F0F' }}
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
