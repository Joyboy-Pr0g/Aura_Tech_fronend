'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Product } from '@/lib/types/entities';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { useFormatPrice } from '@/lib/currency/currency-provider';
import { getProductImageUrl } from '@/lib/products/helpers';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Reveal } from '@/lib/motion/reveal';
import { getOptimalPixelRatio, isMobileViewport, lerp } from '@/lib/utils/scrollCalculations';
import { cn } from '@/lib/utils/cn';

interface TrendingCarousel3DProps {
  products: Product[];
}

const AUTO_ROTATE_MS = 4500;
const DRAG_SENSITIVITY = 0.004;

function tierColor(price: number): number {
  if (price >= 5000) return 0xff0080;
  if (price >= 2000) return 0x00d9ff;
  if (price >= 500) return 0xa855f7;
  return 0x6366f1;
}

export function TrendingCarousel3D({ products }: TrendingCarousel3DProps) {
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const mountRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRot = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const count = products.length;
  const angleStep = count > 0 ? (Math.PI * 2) / count : 0;
  const radius = count <= 4 ? 3.4 : 4.4;

  const go = useCallback(
    (dir: -1 | 1) => {
      setActiveIndex((i) => {
        const next = (i + dir + count) % count;
        targetRotation.current = -next * angleStep;
        return next;
      });
    },
    [angleStep, count],
  );

  useEffect(() => {
    targetRotation.current = -activeIndex * angleStep;
  }, [activeIndex, angleStep]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (count <= 1 || isPaused || isDragging) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => {
        const next = (i + 1) % count;
        targetRotation.current = -next * angleStep;
        return next;
      });
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [angleStep, count, isDragging, isPaused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || count === 0) return;

    const mobile = isMobileViewport();
    let w = mount.clientWidth;
    let h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.5, mobile ? 9.5 : 8.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(getOptimalPixelRatio());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const frontLight = new THREE.DirectionalLight(0x00d9ff, 1.4);
    frontLight.position.set(0, 5, 8);
    scene.add(frontLight);
    const rimLight = new THREE.PointLight(0xff0080, 0.9, 22);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const placeholder = new THREE.CanvasTexture(createPlaceholderCanvas());
    const cardGeo = new THREE.PlaneGeometry(2.35, 3.05, 1, 1);
    const frameGeo = new THREE.PlaneGeometry(2.52, 3.22, 1, 1);

    products.forEach((product, i) => {
      const angle = i * angleStep;
      const cardGroup = new THREE.Group();
      cardGroup.position.x = Math.sin(angle) * radius;
      cardGroup.position.z = Math.cos(angle) * radius;
      cardGroup.rotation.y = angle;

      const tier = tierColor(Number(product.price));
      const imageUrl = getProductImageUrl(product);
      const mat = new THREE.MeshStandardMaterial({
        map: placeholder,
        metalness: 0.35,
        roughness: 0.35,
        side: THREE.DoubleSide,
        emissive: tier,
        emissiveIntensity: 0.08,
      });

      if (imageUrl) {
        loader.load(
          imageUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            mat.map = tex;
            mat.needsUpdate = true;
          },
          undefined,
          () => {
            mat.map = placeholder;
            mat.needsUpdate = true;
          },
        );
      }

      const frameMat = new THREE.MeshBasicMaterial({
        color: tier,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.z = -0.02;
      cardGroup.add(frame);

      const card = new THREE.Mesh(cardGeo, mat);
      cardGroup.add(card);

      const pedestalGeo = new THREE.CylinderGeometry(0.85, 1.05, 0.1, 6);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        emissive: tier,
        emissiveIntensity: 0.25,
        metalness: 0.85,
        roughness: 0.25,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -1.62;
      cardGroup.add(pedestal);

      const beamGeo = new THREE.CylinderGeometry(0.02, 0.08, 1.2, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: tier,
        transparent: true,
        opacity: 0.15,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = -1;
      cardGroup.add(beam);

      group.add(cardGroup);
    });

    const vaultRing = new THREE.Mesh(
      new THREE.RingGeometry(radius - 0.3, radius + 0.35, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    vaultRing.rotation.x = -Math.PI / 2;
    vaultRing.position.y = -1.65;
    scene.add(vaultRing);

    let frameId = 0;
    const animate = () => {
      if (!isDraggingRef.current) {
        currentRotation.current = lerp(currentRotation.current, targetRotation.current, 0.09);
      }
      group.rotation.y = currentRotation.current;
      group.position.y = Math.sin(Date.now() * 0.0012) * 0.06;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      w = mount.clientWidth;
      h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      cardGeo.dispose();
      frameGeo.dispose();
      vaultRing.geometry.dispose();
      (vaultRing.material as THREE.Material).dispose();
      placeholder.dispose();
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial && m.map && m.map !== placeholder) {
              m.map.dispose();
            }
            m.dispose();
          });
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      groupRef.current = null;
    };
  }, [products, count, angleStep, radius]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (count <= 1) return;
      isDraggingRef.current = true;
      setIsDragging(true);
      setIsPaused(true);
      dragStartX.current = e.clientX;
      dragStartRot.current = currentRotation.current;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [count],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartX.current;
    currentRotation.current = dragStartRot.current + dx * DRAG_SENSITIVITY;
    targetRotation.current = currentRotation.current;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      const nearest = Math.round(-currentRotation.current / angleStep);
      const idx = ((nearest % count) + count) % count;
      setActiveIndex(idx);
      targetRotation.current = -idx * angleStep;
      window.setTimeout(() => setIsPaused(false), 2000);
    },
    [angleStep, count],
  );

  if (count === 0) return null;

  const active = products[activeIndex];
  const tier = tierColor(Number(active.price));

  return (
    <section
      className="relative border-t border-primary-500/10 py-20 lg:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !isDragging && setIsPaused(false)}
    >
      <Reveal className="mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6 lg:px-8 sm:text-start">
        <Badge variant="default" className="mb-3 gap-1.5 font-mono text-[10px] uppercase tracking-widest">
          <Sparkles className="h-3 w-3" />
          {t('home.loadoutVaultBadge')}
        </Badge>
        <h2 className="text-3xl font-bold text-white lg:text-4xl">{t('home.trending')}</h2>
        <p className="mt-2 max-w-lg text-sm text-white/40 sm:mx-0 mx-auto">{t('home.dragToRotate')}</p>
      </Reveal>

      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-2 sm:gap-4 sm:px-4">
        <Button
          variant="outline"
          size="icon"
          className="z-20 shrink-0 border-primary-500/25 bg-dark-950/70 backdrop-blur-sm hover:border-primary-400/50"
          onClick={() => {
            setIsPaused(true);
            go(1);
            window.setTimeout(() => setIsPaused(false), 2500);
          }}
          aria-label={t('common.previous')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div
          ref={mountRef}
          className={cn(
            'relative h-[340px] min-w-0 flex-1 touch-none select-none sm:h-[400px] lg:h-[460px]',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden
        />

        <Button
          variant="outline"
          size="icon"
          className="z-20 shrink-0 border-primary-500/25 bg-dark-950/70 backdrop-blur-sm hover:border-primary-400/50"
          onClick={() => {
            setIsPaused(true);
            go(-1);
            window.setTimeout(() => setIsPaused(false), 2500);
          }}
          aria-label={t('common.next')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <Reveal className="mx-auto mt-6 max-w-lg px-4">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-dark-950/75 backdrop-blur-md">
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, #${tier.toString(16).padStart(6, '0')}, transparent)`,
            }}
          />
          <div className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary-500/30 bg-primary-500/10">
              <Zap className="h-5 w-5 text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
                {t('home.loadoutEquipped')}
              </p>
              <p className="truncate text-lg font-semibold text-white">{active.title}</p>
              <p className="mt-0.5 text-2xl font-bold text-primary-400">{formatPrice(active.price)}</p>
            </div>
            <ButtonLink href={`/products/${active.slug}`} size="sm" className="shrink-0 font-mono text-xs uppercase">
              {t('home.shopNow')}
            </ButtonLink>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 flex justify-center gap-1.5">
        {products.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setIsPaused(true);
              setActiveIndex(i);
              targetRotation.current = -i * angleStep;
              window.setTimeout(() => setIsPaused(false), 2500);
            }}
            aria-label={p.title}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              i === activeIndex
                ? 'w-10 bg-gradient-to-r from-primary-400 to-[#ff0080]'
                : 'w-1.5 bg-white/15 hover:bg-white/35',
            )}
          />
        ))}
      </div>
    </section>
  );
}

function createPlaceholderCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grd = ctx.createLinearGradient(0, 0, 256, 320);
    grd.addColorStop(0, '#0a0a12');
    grd.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 320);
    ctx.strokeStyle = 'rgba(0,217,255,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 236, 300);
    ctx.fillStyle = 'rgba(0,217,255,0.15)';
    ctx.fillRect(10, 10, 236, 300);
  }
  return canvas;
}
