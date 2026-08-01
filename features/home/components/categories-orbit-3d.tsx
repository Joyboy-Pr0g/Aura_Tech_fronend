'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Crosshair, Gamepad2, Layers } from 'lucide-react';
import { Category } from '@/lib/types/entities';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { ProductImage } from '@/components/ui/product-image';
import { buildCategoryProductsPath } from '@/lib/storefront/product-paths';
import { Reveal } from '@/lib/motion/reveal';

interface CategoriesOrbit3DProps {
  categories: Category[];
}

type StoneSlot = 'front' | 'left' | 'right' | 'behind' | 'hidden';

function GamingHudFrame({ active }: { active: boolean }) {
  return (
    <>
      <span
        className={cn(
          'pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 transition-colors duration-300',
          active ? 'border-primary-400' : 'border-white/20',
        )}
      />
      <span
        className={cn(
          'pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 transition-colors duration-300',
          active ? 'border-primary-400' : 'border-white/20',
        )}
      />
      <span
        className={cn(
          'pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 transition-colors duration-300',
          active ? 'border-primary-400' : 'border-white/20',
        )}
      />
      <span
        className={cn(
          'pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 transition-colors duration-300',
          active ? 'border-primary-400' : 'border-white/20',
        )}
      />
      {active && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-primary-400/80 to-transparent" />
      )}
    </>
  );
}

function relativeOffset(index: number, activeIndex: number, count: number): number {
  let diff = index - activeIndex;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

function slotForOffset(offset: number, count: number): StoneSlot {
  if (offset === 0) return 'front';
  if (offset === 1) return 'right';
  if (offset === -1) return 'left';
  if (count > 3 && (offset === 2 || offset === -2)) return 'behind';
  return 'hidden';
}

const SLOT_LAYOUT: Record<
  StoneSlot,
  { x: number; z: number; rotateY: number; scale: number; opacity: number; zIndex: number }
> = {
  front: { x: 0, z: 88, rotateY: 0, scale: 1, opacity: 1, zIndex: 40 },
  left: { x: -198, z: 32, rotateY: 20, scale: 0.82, opacity: 0.82, zIndex: 30 },
  right: { x: 198, z: 32, rotateY: -20, scale: 0.82, opacity: 0.82, zIndex: 30 },
  behind: { x: 0, z: -140, rotateY: 0, scale: 0.62, opacity: 0.18, zIndex: 10 },
  hidden: { x: 0, z: -220, rotateY: 0, scale: 0.5, opacity: 0, zIndex: 0 },
};

export function CategoriesOrbit3D({ categories }: CategoriesOrbit3DProps) {
  const { t } = useLocale();
  const count = categories.length;
  const [activeIndex, setActiveIndex] = useState(0);

  const snapToIndex = useCallback(
    (index: number) => {
      if (count <= 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      snapToIndex(activeIndex + dir);
    },
    [activeIndex, snapToIndex],
  );

  const active = categories[activeIndex];

  if (count === 0) return null;

  return (
    <section id="shop-by-category" className="relative py-20 lg:py-28 mb-20">
      <Reveal className="mx-auto mb-6 max-w-7xl px-4 text-center sm:px-6 lg:px-8 sm:text-start">
        <Badge variant="secondary" className="mb-3 gap-1.5 font-mono text-[10px] uppercase tracking-widest">
          <Gamepad2 className="h-3 w-3" />
          {t('home.missionSelectBadge')}
        </Badge>
        <h2 className="text-3xl font-bold text-white lg:text-4xl">{t('home.categories')}</h2>
        <p className="mt-2 text-sm text-white/40">{t('home.dragToBrowse')}</p>
      </Reveal>

      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-2 sm:gap-8 sm:px-4 lg:gap-10">
        <Button
          variant="outline"
          size="icon"
          className="z-20 shrink-0 self-center border-primary-500/25 bg-dark-950/70 backdrop-blur-sm hover:border-primary-400/50 hover:bg-dark-900/80"
          onClick={() => go(-1)}
          disabled={count <= 1}
          aria-label={t('common.previous')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div className="mb-1 w-full max-w-sm px-1">
            <div className="relative overflow-hidden rounded-lg border border-primary-500/25 bg-dark-950/70 px-4 py-2.5 backdrop-blur-md">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-400 to-[#ff0080]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-400/80">
                {t('home.missionActive')}
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="text-lg font-bold text-white sm:text-xl">{active?.name}</p>
                <p className="font-mono text-xs tabular-nums text-white/35">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </p>
              </div>
            </div>
            {active && (
              <ButtonLink
                href={buildCategoryProductsPath(active.slug, null)}
                size="sm"
                className="mt-1.5 w-full gap-2 font-mono text-xs uppercase tracking-wider sm:w-auto"
              >
                {t('home.enterCategory')}
              </ButtonLink>
            )}
          </div>

          <div
            className="relative flex w-full items-center justify-center overflow-visible"
            style={{ perspective: '1200px' }}
          >
            <Crosshair
              className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-primary-400/25"
              strokeWidth={1}
            />

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-32 sm:w-32"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,217,255,0.12) 0%, rgba(255,0,128,0.05) 40%, transparent 70%)',
                boxShadow: '0 0 120px rgba(0,217,255,0.1)',
              }}
            />

            <div className="relative z-10 mx-auto h-[250px] w-full max-w-3xl [transform-style:preserve-3d] sm:h-[280px]">
              {categories.map((category, index) => {
                const offset = relativeOffset(index, activeIndex, count);
                const slot = slotForOffset(offset, count);
                const layout = SLOT_LAYOUT[slot];
                const isFront = slot === 'front';
                const isInteractive = slot !== 'hidden' && slot !== 'behind';

                return (
                  <div
                    key={category.id}
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[190px] w-[150px] sm:h-[210px] sm:w-[165px]',
                      '[transform-style:preserve-3d] transition-[transform,opacity] duration-500 ease-out',
                      !isInteractive && 'pointer-events-none',
                    )}
                    style={{
                      transform: `translate(-50%, -50%) translateX(${layout.x}px) translateZ(${layout.z}px) rotateY(${layout.rotateY}deg) scale(${layout.scale})`,
                      opacity: layout.opacity,
                      zIndex: layout.zIndex,
                    }}
                  >
                    <Link
                      href={buildCategoryProductsPath(category.slug, null)}
                      draggable={false}
                      tabIndex={isInteractive ? 0 : -1}
                      aria-hidden={!isInteractive}
                      className={cn(
                        'group relative block h-full w-full overflow-hidden rounded-lg border transition-colors duration-500',
                        'bg-dark-950/85 backdrop-blur-md',
                        isFront
                          ? 'border-primary-400/70 shadow-[0_0_50px_rgba(0,217,255,0.3),inset_0_0_30px_rgba(0,217,255,0.05)]'
                          : 'border-white/10 hover:border-primary-500/40',
                      )}
                    >
                      <GamingHudFrame active={isFront} />
                      <div className="relative aspect-[4/3] overflow-hidden bg-dark-800">
                        {category.image_url ? (
                          <ProductImage
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Layers className="h-10 w-10 text-primary-400/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 via-dark-950/20 to-transparent" />
                        <div
                          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,217,255,0.04) 2px, rgba(0,217,255,0.04) 4px)',
                          }}
                        />
                      </div>
                      {(isFront || slot === 'left' || slot === 'right') && (
                        <div className="p-2 text-center">
                          <h3
                            className={cn(
                              'truncate text-xs font-semibold transition-colors sm:text-sm',
                              isFront ? 'text-primary-300' : 'text-white/80 group-hover:text-primary-400',
                            )}
                          >
                            {category.name}
                          </h3>
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="z-20 shrink-0 self-center border-primary-500/25 bg-dark-950/70 backdrop-blur-sm hover:border-primary-400/50 hover:bg-dark-900/80"
          onClick={() => go(1)}
          disabled={count <= 1}
          aria-label={t('common.next')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => snapToIndex(i)}
            aria-label={cat.name}
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
