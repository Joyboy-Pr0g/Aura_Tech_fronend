'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getOptimalPixelRatio, isMobileViewport, lerp } from '@/lib/utils/scrollCalculations';

/**
 * Gaming Nexus — synthwave arena: infinite grid, power core, embers, mouse parallax.
 */
export function HomeShowcaseScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const mobile = isMobileViewport();
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.038);

    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 140);
    camera.position.set(0, 1.2, 11);
    camera.lookAt(0, -0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(getOptimalPixelRatio());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x1a2030, 0.55));

    const cyanLight = new THREE.PointLight(0x00d9ff, 2.4, 50);
    cyanLight.position.set(0, 4, 6);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff0080, 1.2, 40);
    magentaLight.position.set(-6, 2, 2);
    scene.add(magentaLight);

    const violetLight = new THREE.PointLight(0x7c3aed, 1, 35);
    violetLight.position.set(6, -1, 4);
    scene.add(violetLight);

    const gridGroup = new THREE.Group();
    gridGroup.position.y = -2.8;
    scene.add(gridGroup);

    for (let layer = 0; layer < 3; layer++) {
      const size = 60 + layer * 20;
      const divisions = mobile ? 24 : 40;
      const grid = new THREE.GridHelper(size, divisions, 0x00d9ff, 0x0a1a2e);
      grid.material.transparent = true;
      (grid.material as THREE.Material).opacity = 0.22 - layer * 0.06;
      grid.position.z = -layer * 8;
      gridGroup.add(grid);
    }

    const horizonGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 20),
      new THREE.MeshBasicMaterial({
        color: 0x4c1d95,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    horizonGlow.position.set(0, 2, -35);
    scene.add(horizonGlow);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.2, -1);
    scene.add(coreGroup);

    const coreGeo = new THREE.OctahedronGeometry(1.1, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x020810,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.7,
      metalness: 0.95,
      roughness: 0.12,
      flatShading: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(core);

    const coreWire = new THREE.Mesh(
      coreGeo.clone(),
      new THREE.MeshBasicMaterial({
        color: 0xff0080,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      }),
    );
    coreWire.scale.setScalar(1.15);
    coreGroup.add(coreWire);

    const coreRingGeo = new THREE.TorusGeometry(1.65, 0.025, 8, mobile ? 48 : 96);
    const rings: THREE.Mesh[] = [];
    for (let r = 0; r < 2; r++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: r === 0 ? 0x00d9ff : 0xff0080,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(coreRingGeo.clone(), ringMat);
      ring.rotation.x = Math.PI / 2 + r * 0.35;
      ring.rotation.y = r * 0.5;
      coreGroup.add(ring);
      rings.push(ring);
    }

    const hexGroup = new THREE.Group();
    scene.add(hexGroup);
    const hexMeshes: THREE.Mesh[] = [];
    const hexCount = mobile ? 6 : 12;
    for (let i = 0; i < hexCount; i++) {
      const hexGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 6);
      const hexMat = new THREE.MeshStandardMaterial({
        color: 0x0a1020,
        emissive: i % 2 === 0 ? 0x00d9ff : 0x9333ea,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.2,
      });
      const hex = new THREE.Mesh(hexGeo, hexMat);
      const angle = (i / hexCount) * Math.PI * 2;
      const dist = 4.5 + (i % 3) * 1.2;
      hex.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 3, Math.sin(angle) * dist - 2);
      hex.rotation.x = Math.random() * Math.PI;
      hex.rotation.z = Math.random() * Math.PI;
      hexGroup.add(hex);
      hexMeshes.push(hex);
    }

    const emberCount = mobile ? 120 : 280;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 24;
      emberPositions[i * 3 + 1] = Math.random() * 8 - 4;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
      emberSpeeds[i] = 0.008 + Math.random() * 0.02;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: mobile ? 0.05 : 0.07,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let frameId = 0;
    const clock = new THREE.Clock();
    const camBase = { x: 0, y: 1.2, z: 11 };

    const animate = () => {
      const t = clock.getElapsedTime();

      core.rotation.y = t * 0.4;
      core.rotation.x = Math.sin(t * 0.3) * 0.15;
      coreWire.rotation.copy(core.rotation);
      rings.forEach((ring, i) => {
        ring.rotation.z = t * (0.15 + i * 0.08);
      });
      coreGroup.position.y = 0.2 + Math.sin(t * 0.8) * 0.1;

      gridGroup.position.z = (t * 3) % 8;

      hexMeshes.forEach((hex, i) => {
        hex.rotation.y = t * (0.2 + i * 0.03);
        hex.position.y += Math.sin(t + i) * 0.002;
      });
      hexGroup.rotation.y = t * 0.04;

      const pos = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        pos[i * 3 + 1] += emberSpeeds[i];
        if (pos[i * 3 + 1] > 6) {
          pos[i * 3 + 1] = -4;
          pos[i * 3] = (Math.random() - 0.5) * 24;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      camera.position.x = lerp(camera.position.x, camBase.x + mouseX * 1.2, 0.04);
      camera.position.y = lerp(camera.position.y, camBase.y - mouseY * 0.5, 0.04);
      camera.lookAt(mouseX * 0.5, -0.5, 0);

      cyanLight.intensity = 2.2 + Math.sin(t * 2) * 0.3;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      coreGeo.dispose();
      coreMat.dispose();
      coreWire.geometry.dispose();
      (coreWire.material as THREE.Material).dispose();
      coreRingGeo.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      hexMeshes.forEach((hex) => {
        hex.geometry.dispose();
        (hex.material as THREE.Material).dispose();
      });
      emberGeo.dispose();
      emberMat.dispose();
      horizonGlow.geometry.dispose();
      (horizonGlow.material as THREE.Material).dispose();
      gridGroup.traverse((obj) => {
        if (obj instanceof THREE.GridHelper) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
