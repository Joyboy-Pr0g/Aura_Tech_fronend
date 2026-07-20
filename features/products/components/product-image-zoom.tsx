'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductImage } from '@/components/ui/product-image';
import { cn } from '@/lib/utils/cn';
import { EASE_OUT_EXPO } from '@/lib/motion/reveal';

const ZOOM_SCALE = 1.7;

interface ProductImageZoomProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function ProductImageZoom({ src, alt, priority }: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canZoom, setCanZoom] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setCanZoom(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  const updateOrigin = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOrigin({
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canZoom) return;
    updateOrigin(event.clientX, event.clientY);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-dark-800',
        canZoom && (zooming ? 'cursor-zoom-out' : 'cursor-zoom-in'),
      )}
      onMouseEnter={() => canZoom && setZooming(true)}
      onMouseLeave={() => {
        setZooming(false);
        setOrigin({ x: 50, y: 50 });
      }}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={src}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          className="absolute inset-0"
        >
          <div
            className="h-full w-full will-change-transform"
            style={{
              transform: canZoom && zooming ? `scale(${ZOOM_SCALE})` : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transition: canZoom && zooming ? 'transform 0.05s linear' : 'transform 0.3s ease-out',
            }}
          >
            <ProductImage
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
