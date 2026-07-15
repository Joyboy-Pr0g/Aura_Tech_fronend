'use client';

import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

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

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-dark-950">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block text-xl font-bold">
              <span className="text-primary-400">AURA</span>
              <span className="text-white"> TECH</span>
            </Link>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-400 shrink-0" />
                {t('footer.location')}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400 shrink-0" />
                +967 777 000 000
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400 shrink-0" />
                hello@auratech.com
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
            © {new Date().getFullYear()} AURA TECH. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Facebook, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-white/40 hover:text-primary-400 transition-colors"
                aria-label={t('footer.social')}
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
