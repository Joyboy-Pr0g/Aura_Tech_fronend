'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Globe, Instagram } from 'lucide-react';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  DEFAULT_WEBSITE_LOGO,
  FALLBACK_WEBSITE_SETTINGS,
  formatWhatsappLink,
} from '@/lib/website-settings/defaults';

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/auratech.stor?igsh=MWwzdWs0bHloYzBy',
    icon: Instagram,
    label: 'Instagram',
    badge: null,
  },
  {
    href: 'https://www.tiktok.com/@auratech.stor?_r=1&_t=ZS-987hZ8gQZMO',
    icon: null,
    label: 'TikTok',
    badge: 'TT',
  },
  {
    href: formatWhatsappLink('+967770584331'),
    icon: null,
    label: 'WhatsApp',
    badge: 'WA',
  },
] as const;

export function ComingSoonPage() {
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <HomePageBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-end p-4 sm:p-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            aria-label={t('nav.toggleLanguage')}
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'العربية' : 'English'}
          </Button>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
            <div className="relative mb-8 h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(0,217,255,0.15)] sm:h-28 sm:w-28">
              <Image
                src={DEFAULT_WEBSITE_LOGO}
                alt="AuraTech"
                fill
                priority
                className="object-cover"
                sizes="112px"
              />
            </div>

            <Badge className="mb-5 gap-1.5 px-3 py-1">
              <Clock3 className="h-3.5 w-3.5" />
              {t('storefront.comingSoon.badge')}
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#0066FF]">
                AuraTech
              </span>
            </h1>

            <p className="mt-4 text-xl font-semibold text-white sm:text-2xl">
              {t('storefront.comingSoon.title')}
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              {t('storefront.comingSoon.description')}
            </p>

            <div className="mt-10 w-full max-w-md">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#00D9FF] to-[#0066FF] shadow-[0_0_16px_rgba(0,217,255,0.45)]" />
              </div>
              <p className="mt-3 text-sm text-white/40">{t('storefront.comingSoon.progress')}</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <p>{t('storefront.comingSoon.contact')}{' '}</p>
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, badge }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-primary-500/40 hover:bg-primary-500/10 hover:text-primary-300"
                >
                  {Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{badge}</span>
                  )}
                  {label}
                </a>
              ))}
            </div>

            <Link
              href="/login"
              className="mt-6 text-xs text-white/30 transition-colors hover:text-white/50"
            >
              {t('storefront.comingSoon.staffLogin')}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
