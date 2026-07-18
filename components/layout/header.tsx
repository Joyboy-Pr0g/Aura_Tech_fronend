'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { User as UserType, WebsiteSettings } from '@/lib/types/entities';
import { HeaderSearch } from '@/components/layout/header-search';
import { UserMenu } from '@/components/layout/user-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { CartPanel } from '@/components/cart/cart-panel';
import { useCartUiStore } from '@/lib/stores/cart-ui-store';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getCart } from '@/features/cart/services/cart-client';
import { resolveWebsiteLogo, splitWebsiteTitle } from '@/lib/website-settings/defaults';

interface HeaderProps {
  user?: UserType | null;
  settings: WebsiteSettings;
}

export function Header({ user, settings }: HeaderProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const { itemCount, setItemCount, togglePanel } = useCartUiStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoSrc = resolveWebsiteLogo(settings.header_logo_url);
  const { primary, secondary } = splitWebsiteTitle(settings.title);

  useEffect(() => {
    if (!user) {
      setItemCount(0);
      return;
    }
    getCart()
      .then((c) => setItemCount(c.items?.length ?? 0))
      .catch(() => setItemCount(0));
  }, [user, pathname, setItemCount]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-dark-950/85 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center gap-3 lg:gap-6">
            {/* Logo — start side (right in RTL) */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-primary-500/30 bg-primary-500/15 group-hover:glow-primary transition-shadow">
                <Image
                  src={logoSrc}
                  alt={settings.title}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:inline">
                <span className="text-primary-400 drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">{primary}</span>
                {secondary && <span className="text-white"> {secondary}</span>}
              </span>
            </Link>

            {/* Search — center */}
            <HeaderSearch className="hidden md:flex" />

            {/* Actions — end side (left in RTL) */}
            <div className="flex items-center gap-2 ms-auto">
              <button
                type="button"
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="flex p-2 rounded-lg text-white/50 hover:text-primary-400 hover:bg-white/5"
                aria-label={t('nav.toggleLanguage')}
              >
                <Globe className="h-4 w-4" />
              </button>

              {user ? (
                <>
                  <NotificationBell audience={user.role as 'admin' | 'customer'} />
                  <UserMenu user={user} />
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <ButtonLink href="/login" variant="ghost" size="sm">
                    {t('nav.login')}
                  </ButtonLink>
                  <ButtonLink href="/register" size="sm">
                    {t('nav.register')}
                  </ButtonLink>
                </div>
              )}

              <button
                type="button"
                onClick={togglePanel}
                className="relative p-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-primary-400 transition-colors"
                aria-label={t('nav.cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-white/70 hover:bg-white/5"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={t('nav.toggleMenu')}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className={cn('md:hidden pb-3', !mobileOpen && 'hidden')}>
            <HeaderSearch />
            {!user && (
              <div className="flex gap-2 mt-3 sm:hidden">
                <ButtonLink href="/login" variant="outline" className="flex-1">
                  {t('nav.login')}
                </ButtonLink>
                <ButtonLink href="/register" className="flex-1">
                  {t('nav.register')}
                </ButtonLink>
              </div>
            )}
          </div>
        </Container>
      </header>
      <CartPanel />
      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
