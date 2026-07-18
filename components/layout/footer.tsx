'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { WebsiteSettings } from '@/lib/types/entities';
import {
  formatWhatsappLink,
  resolveWebsiteLogo,
  splitWebsiteTitle,
} from '@/lib/website-settings/defaults';

const FOOTER_LINKS = {
  shop: [
    { href: '/products', labelKey: 'footer.allProducts' as const },
    { href: '/products?category_id=laptops', labelKey: 'footer.laptops' as const },
    { href: '/products?category_id=smartphones', labelKey: 'footer.smartphones' as const },
    { href: '/products?category_id=accessories', labelKey: 'footer.accessories' as const },
  ],
  company: [
    { href: '/about', labelKey: 'footer.about' as const },
    { href: '/blogs', labelKey: 'footer.blog' as const },
    { href: '/contact', labelKey: 'footer.contact' as const },
  ],
  account: [
    { href: '/login', labelKey: 'footer.signIn' as const },
    { href: '/register', labelKey: 'footer.register' as const },
    { href: '/dashboard', labelKey: 'footer.myAccount' as const },
  ],
};

const SECTION_TITLE_KEYS = {
  shop: 'footer.shop',
  company: 'footer.company',
  account: 'footer.account',
} as const;

interface FooterProps {
  settings: WebsiteSettings;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function Footer({ settings }: FooterProps) {
  const { t } = useLocale();
  const logoSrc = resolveWebsiteLogo(settings.footer_logo_url);
  const { primary, secondary } = splitWebsiteTitle(settings.title);

  const socialLinks = [
    { href: settings.facebook, icon: Facebook, label: t('admin.websiteFacebook') },
    { href: settings.instagram, icon: Instagram, label: t('admin.websiteInstagram') },
    { href: formatWhatsappLink(settings.whatsapp ?? ''), icon: MessageCircle, label: t('admin.websiteWhatsapp') },
    { href: settings.tiktok, icon: TikTokIcon, label: t('admin.websiteTiktok') },
  ].filter((link) => Boolean(link.href?.trim()));

  return (
    <footer className="relative z-10 border-t border-white/5 bg-dark-950">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={logoSrc}
                  alt={settings.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary-400">{primary}</span>
                {secondary && <span className="text-white"> {secondary}</span>}
              </span>
            </Link>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              {settings.description}
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400 shrink-0" />
                <a href={`tel:${settings.website_phone}`} className="hover:text-primary-400 transition-colors">
                  {settings.website_phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400 shrink-0" />
                <a href={`mailto:${settings.website_email}`} className="hover:text-primary-400 transition-colors">
                  {settings.website_email}
                </a>
              </p>
            </div>
          </div>

          {(Object.keys(FOOTER_LINKS) as Array<keyof typeof FOOTER_LINKS>).map((section) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {t(SECTION_TITLE_KEYS[section])}
              </h4>
              <ul className="space-y-2">
                {FOOTER_LINKS[section].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-primary-400 transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {settings.title}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-primary-400 transition-colors"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
