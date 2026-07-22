'use client';

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
import { useOrbitDrag } from '@/features/home/hooks/use-orbit-drag';

interface CategoriesOrbit3DProps {
  categories: Category[];
}

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

export function CategoriesOrbit3D({ categories }: CategoriesOrbit3DProps) {
  const { t } = useLocale();
  const count = categories.length;

  const { ringRef, activeIndex, snapToIndex, go, angleStep, isDragging, dragHandlers } =
    useOrbitDrag(count);

  const cardSpan = 155;
  const ringGap = 36;
  const minOrbitRadius = (count * (cardSpan + ringGap)) / (2 * Math.PI);
  const radius = Math.max(minOrbitRadius, 320, Math.min(520, 280 + count * 12));

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

      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-2 sm:gap-4 sm:px-4 lg:gap-6">
        <Button
          variant="outline"
          size="icon"
          className="z-20 shrink-0 self-center border-primary-500/25 bg-dark-950/70 backdrop-blur-sm hover:border-primary-400/50 hover:bg-dark-900/80"
          onClick={() => go(1)}
          aria-label={t('common.previous')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col items-center">
          {/* Active category HUD — sits directly above the ring */}
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
          className={cn(
            'relative flex w-full touch-none select-none items-start justify-center overflow-visible pt-1',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{ perspective: '1700px' }}
          {...dragHandlers}
        >
          {/* Reticle */}
          <Crosshair
            className="pointer-events-none absolute left-1/2 top-[calc(50%+4px)] z-[5] h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-primary-400/25"
            strokeWidth={1}
          />

          <div
            className="pointer-events-none absolute left-1/2 top-[calc(50%+4px)] z-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-32 sm:w-32"
            style={{
              background:
                'radial-gradient(circle, rgba(0,217,255,0.12) 0%, rgba(255,0,128,0.05) 40%, transparent 70%)',
              boxShadow: '0 0 120px rgba(0,217,255,0.1)',
            }}
          />

          <div
            ref={ringRef}
            className="relative z-10 mx-auto h-[200px] w-full max-w-none [transform-style:preserve-3d] sm:h-[220px] lg:h-[240px]"
            style={{ willChange: 'transform' }}
          >
            {categories.map((category, index) => {
              const isActive = index === activeIndex;
              const itemAngle = index * angleStep;
              let angleDiff = index - activeIndex;
              if (angleDiff > count / 2) angleDiff -= count;
              if (angleDiff < -count / 2) angleDiff += count;
              angleDiff = Math.abs(angleDiff);
              const depthScale = isActive ? 1.08 : Math.max(0.7, 0.92 - angleDiff * 0.09);

              return (
                <div
                  key={category.id}
                  className="absolute left-1/2 top-1/2 h-[175px] w-[140px] sm:h-[190px] sm:w-[155px] [transform-style:preserve-3d]"
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) rotateY(${-itemAngle}deg) scale(${depthScale})`,
                    opacity: isActive ? 1 : Math.max(0.4, 0.82 - angleDiff * 0.14),
                    transition: isDragging ? 'none' : 'opacity 0.4s ease',
                  }}
                >
                  <Link
                    href={buildCategoryProductsPath(category.slug, null)}
                    draggable={false}
                    onClick={(e) => {
                      if (isDragging) e.preventDefault();
                    }}
                    className={cn(
                      'group relative block h-full w-full overflow-hidden rounded-lg border transition-all duration-500',
                      'bg-dark-950/85 backdrop-blur-md',
                      isActive
                        ? 'border-primary-400/70 shadow-[0_0_50px_rgba(0,217,255,0.3),inset_0_0_30px_rgba(0,217,255,0.05)]'
                        : 'border-white/10 hover:border-primary-500/40',
                    )}
                  >
                    <GamingHudFrame active={isActive} />
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
                    <div className="p-2 text-center">
                      <h3
                        className={cn(
                          'text-xs font-semibold transition-colors sm:text-sm',
                          isActive ? 'text-primary-300' : 'text-white/80 group-hover:text-primary-400',
                        )}
                      >
                        {category.name}
                      </h3>
                    </div>
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
          onClick={() => go(-1)}
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
