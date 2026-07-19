'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gamepad2, Headphones, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import { splitWebsiteTitle, withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';
import { WebsiteSettings } from '@/lib/types/entities';
import type { TranslationKey } from '@/lib/i18n/en';

const SLIDE_INTERVAL_MS = 6000;

type SlideConfig = {
  icon: LucideIcon;
  badgeKey: TranslationKey;
  headingKey: TranslationKey;
  bodyKey: TranslationKey;
  headingTag: 'h2' | 'h3';
};

const SLIDES: SlideConfig[] = [
  {
    icon: Sparkles,
    badgeKey: 'home.seo.slide1Badge',
    headingKey: 'home.seo.heading',
    bodyKey: 'home.seo.intro',
    headingTag: 'h2',
  },
  {
    icon: Gamepad2,
    badgeKey: 'home.seo.slide2Badge',
    headingKey: 'home.seo.productsHeading',
    bodyKey: 'home.seo.productsBody',
    headingTag: 'h3',
  },
  {
    icon: Headphones,
    badgeKey: 'home.seo.slide3Badge',
    headingKey: 'home.seo.serviceHeading',
    bodyKey: 'home.seo.serviceBody',
    headingTag: 'h3',
  },
  {
    icon: TrendingUp,
    badgeKey: 'home.seo.slide4Badge',
    headingKey: 'home.seo.ctaHeading',
    bodyKey: 'home.seo.ctaBody',
    headingTag: 'h3',
  },
];

interface HomeSeoSliderProps {
  settings: WebsiteSettings;
  className?: string;
}

export function HomeSeoSlider({ settings, className }: HomeSeoSliderProps) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const s = withWebsiteSettingsDefaults(settings);
  const { primary, secondary } = splitWebsiteTitle(s.title);
  const brand = secondary ? `${primary} ${secondary}` : primary;
  const copyParams = useMemo(
    () => ({ brand, metaTitle: s.meta_title ?? brand }),
    [brand, s.meta_title],
  );

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused]);

  const activeSlide = SLIDES[activeIndex];
  const ActiveIcon = activeSlide.icon;
  const HeadingTag = activeSlide.headingTag;

  return (
    <div
      className={cn('mx-auto w-full max-w-2xl', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Card className="relative overflow-hidden border-primary-500/25 bg-dark-900/70 shadow-[0_0_40px_rgba(0,217,255,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,217,255,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(0,102,255,0.1),transparent_50%)]" />

        <CardContent className="relative p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5 text-xs">
              <ActiveIcon className="h-3 w-3 text-primary-400" />
              {t(activeSlide.badgeKey)}
            </Badge>
            <span className="text-[11px] tabular-nums text-white/35">
              {activeIndex + 1} / {SLIDES.length}
            </span>
          </div>

          <div className="relative min-h-[132px] sm:min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.bodyKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-2"
              >
                <HeadingTag
                  id={activeSlide.headingTag === 'h2' ? 'home-seo-heading' : undefined}
                  className="text-lg font-bold leading-snug text-white sm:text-xl"
                >
                  {t(activeSlide.headingKey, copyParams)}
                </HeadingTag>
                <p className="line-clamp-4 text-xs leading-relaxed text-white/55 sm:text-sm">
                  {t(activeSlide.bodyKey, copyParams)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                key={`${activeIndex}-${paused ? 'paused' : 'play'}`}
                className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] to-[#0066FF]"
                initial={{ width: '0%' }}
                animate={{ width: paused ? `${((activeIndex + 1) / SLIDES.length) * 100}%` : '100%' }}
                transition={{
                  duration: paused ? 0.2 : SLIDE_INTERVAL_MS / 1000,
                  ease: 'linear',
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              {SLIDES.map((slide, index) => (
                <button
                  key={slide.bodyKey}
                  type="button"
                  aria-label={`${t(slide.badgeKey)} (${index + 1}/${SLIDES.length})`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    index === activeIndex
                      ? 'w-7 bg-primary-400'
                      : 'w-2 bg-white/20 hover:bg-white/35',
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sr-only">
        {SLIDES.map((slide) => (
          <article key={`seo-${slide.bodyKey}`}>
            {slide.headingTag === 'h2' ? (
              <h2>{t(slide.headingKey, copyParams)}</h2>
            ) : (
              <h3>{t(slide.headingKey, copyParams)}</h3>
            )}
            <p>{t(slide.bodyKey, copyParams)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
