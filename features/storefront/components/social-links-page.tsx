'use client';

import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Stagger, staggerItemVariants } from '@/lib/motion/reveal';
import { WebsiteSettings } from '@/lib/types/entities';
import {
  getSocialLinksFromSettings,
  type SocialLinkKey,
} from '@/lib/website-settings/social-links';
import {
  resolveWebsiteLogo,
  splitWebsiteTitle,
} from '@/lib/website-settings/defaults';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const LINK_ICONS: Record<SocialLinkKey, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: TikTokIcon,
  site_url: Globe,
};

function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

interface SocialLinksPageProps {
  settings: WebsiteSettings;
}

export function SocialLinksPage({ settings }: SocialLinksPageProps) {
  const { t, locale, setLocale } = useLocale();
  const logoSrc = resolveWebsiteLogo(settings.header_logo_url ?? settings.footer_logo_url);
  const { primary, secondary } = splitWebsiteTitle(settings.title);
  const links = getSocialLinksFromSettings(settings);
  const themeGlow = settings.theme_color?.trim() || '#00d9ff';

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

        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
          <Stagger immediate className="mx-auto flex w-full max-w-md flex-col items-center text-center">
            <motion.div variants={staggerItemVariants} className="mb-8">
              <motion.div
                className="relative mx-auto h-28 w-28 overflow-hidden rounded-3xl border border-white/15 bg-dark-900/60 shadow-[0_0_60px_rgba(0,217,255,0.2)] backdrop-blur-xl sm:h-32 sm:w-32"
                animate={{
                  boxShadow: [
                    `0 0 40px ${themeGlow}33`,
                    `0 0 72px ${themeGlow}55`,
                    `0 0 40px ${themeGlow}33`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={logoSrc}
                  alt={settings.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="128px"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10"
                  aria-hidden
                />
              </motion.div>
            </motion.div>

            <motion.div variants={staggerItemVariants} className="space-y-3">
              <Badge variant="default" className="gap-1.5 px-3 py-1">
                <ExternalLink className="h-3.5 w-3.5" />
                {t('links.badge')}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#0066FF]">
                  {primary}
                </span>
                {secondary ? (
                  <span className="text-white"> {secondary}</span>
                ) : null}
              </h1>
              {settings.description ? (
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/55 sm:text-base">
                  {settings.description}
                </p>
              ) : null}
            </motion.div>

            <motion.ul variants={staggerItemVariants} className="mt-10 w-full space-y-3">
              {links.map((link, index) => {
                const Icon = LINK_ICONS[link.key];
                const label = t(link.labelKey);
                const external = isExternalHref(link.href);
                const content = (
                  <>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#00D9FF]"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block truncate text-sm font-semibold text-white">{label}</span>
                      <span className="block truncate text-xs text-white/45">{link.href.replace(/^https?:\/\//, '')}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-[#00D9FF]" />
                  </>
                );
                const className =
                  'group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-dark-900/55 px-4 py-3.5 text-start backdrop-blur-xl transition hover:border-[#00D9FF]/40 hover:bg-dark-900/80 hover:shadow-[0_0_32px_rgba(0,217,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/50';

                return (
                  <motion.li
                    key={link.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link href={link.href} className={className}>
                        {content}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>

            {links.length === 0 ? (
              <motion.p variants={staggerItemVariants} className="mt-8 text-sm text-white/50">
                {t('links.empty')}
              </motion.p>
            ) : null}
          </Stagger>
        </main>
      </div>
    </div>
  );
}
