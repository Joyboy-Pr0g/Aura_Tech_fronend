'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { User } from '@/lib/types/entities';
import { logout } from '@/features/auth/services/auth-service';
import {
  ShoppingCart, Package, MapPin, UserIcon,
  LayoutDashboard, Users, ClipboardList, Banknote, LogOut, Heart, Star,
  Menu, X, ChevronsLeft, ChevronsRight,
  ListIcon, Truck, Tag, Bell, BookOpen,
  Settings, HelpCircle, BarChart3, RotateCcw, Receipt,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useAdminNavBadges } from '@/features/admin/hooks/use-admin-nav-badges';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  badgeKey?: 'pending_orders' | 'pending_payments' | 'unanswered_questions' | 'pending_refunds';
}

const CUSTOMER_NAV: NavItem[] = [
  { key: 'sidebar.dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'sidebar.orders', href: '/dashboard/orders', icon: <Package size={18} /> },
  { key: 'sidebar.notifications', href: '/dashboard/notifications', icon: <Bell size={18} /> },
  { key: 'sidebar.cart', href: '/cart', icon: <ShoppingCart size={18} /> },
  { key: 'sidebar.wishlist', href: '/dashboard/wishlist', icon: <Heart size={18} /> },
  { key: 'sidebar.reviews', href: '/dashboard/reviews', icon: <Star size={18} /> },
  { key: 'sidebar.addresses', href: '/dashboard/addresses', icon: <MapPin size={18} /> },
  { key: 'sidebar.profile', href: '/dashboard/profile', icon: <UserIcon size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { key: 'sidebar.dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { key: 'sidebar.notifications', href: '/admin/notifications', icon: <Bell size={18} /> },
  { key: 'sidebar.users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'sidebar.categories', href: '/admin/categories', icon: <ListIcon size={18} /> },
  { key: 'sidebar.products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'sidebar.adminOrders', href: '/admin/orders', icon: <ClipboardList size={18} />, badgeKey: 'pending_orders' },
  { key: 'sidebar.questions', href: '/admin/questions', icon: <HelpCircle size={18} />, badgeKey: 'unanswered_questions' },
  { key: 'sidebar.shippingFees', href: '/admin/shipping-fees', icon: <Truck size={18} /> },
  { key: 'sidebar.coupons', href: '/admin/coupons', icon: <Tag size={18} /> },
  { key: 'sidebar.blogs', href: '/admin/blogs', icon: <BookOpen size={18} /> },
  { key: 'sidebar.analytics', href: '/admin/analytics', icon: <BarChart3 size={18} /> },
  { key: 'sidebar.payments', href: '/admin/payments', icon: <Banknote size={18} />, badgeKey: 'pending_payments' },
  { key: 'sidebar.refunds', href: '/admin/refunds', icon: <RotateCcw size={18} />, badgeKey: 'pending_refunds' },
  { key: 'sidebar.expenses', href: '/admin/expenses', icon: <Receipt size={18} /> },
  { key: 'sidebar.profile', href: '/admin/profile', icon: <UserIcon size={18} /> },
  { key: 'sidebar.settings', href: '/admin/settings', icon: <Settings size={18} /> },
];

const SIDEBAR_COMPACT_KEY = 'aura-sidebar-compact';

interface SidebarProps {
  type: 'customer' | 'admin';
  user: User;
}

export function Sidebar({ type, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const navItems = type === 'customer' ? CUSTOMER_NAV : ADMIN_NAV;
  const adminBadges = useAdminNavBadges(type === 'admin');

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COMPACT_KEY);
    if (saved === 'true') setCompact(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COMPACT_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Still redirect on failure
    }
    router.push('/login');
    router.refresh();
  };

  const brand = (
    <div
      className={cn(
        'flex border-b border-white/5 shrink-0',
        compact
          ? 'flex-col items-center gap-2 px-2 py-3 lg:px-1.5'
          : 'items-center gap-2 px-4 py-5',
      )}
    >
      {!compact && (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
          <Link href={'/'} className="inline-block" onClick={() => setOpen(false)}>
            <h1 className="text-xl font-bold">
              <span className="text-primary-500">AURA</span>{' '}
              <span className="text-white">TECH</span>
            </h1>
          </Link>
          <Badge variant="outline" className="text-xs mt-2 w-fit">
            {type === 'admin' ? t('sidebar.adminPanel') : t('sidebar.customerPortal')}
          </Badge>
        </div>
      )}

      {compact && (
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-primary-400 hover:bg-white/5"
          title="AURA TECH"
        >
          AT
        </Link>
      )}

      <button
        type="button"
        onClick={toggleCompact}
        className="hidden shrink-0 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white lg:inline-flex"
        aria-label={compact ? t('sidebar.expand') : t('sidebar.collapse')}
        title={compact ? t('sidebar.expand') : t('sidebar.collapse')}
      >
        {compact ? (
          <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
        ) : (
          <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
        )}
      </button>
    </div>
  );

  const nav = (
    <nav className={cn('flex-1 min-h-0 py-4 space-y-1 overflow-y-auto', compact ? 'px-2 lg:px-1.5' : 'px-3')}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const badgeCount = type === 'admin' && item.badgeKey ? adminBadges[item.badgeKey] : 0;
        const label = t(item.key);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            className={cn(
              'sidebar-item',
              compact && 'lg:justify-center lg:gap-0 lg:px-2 lg:relative',
              isActive && 'sidebar-item-active',
            )}
          >
            {item.icon}
            <span className={cn('flex-1', compact && 'lg:hidden')}>{label}</span>
            {badgeCount > 0 && (
              <span
                className={cn(
                  'ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white',
                  compact && 'lg:absolute lg:top-1.5 lg:end-1.5 lg:ms-0 lg:h-2 lg:min-w-2 lg:px-0 lg:text-[0]',
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className={cn('border-t border-white/5 shrink-0', compact ? 'px-2 py-3 lg:px-1.5' : 'px-3 py-4')}>
      {!compact && (
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-white/80 truncate">{user.full_name || user.email}</p>
          <p className="text-xs text-white/30 capitalize">
            {user.role ? (() => {
              const key = `admin.role.${user.role}`;
              const label = t(key);
              return label === key ? user.role.replace('_', ' ') : label;
            })() : ''}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        title={compact ? t('sidebar.signOut') : undefined}
        aria-label={compact ? t('sidebar.signOut') : undefined}
        className={cn(
          'sidebar-item w-full text-danger hover:text-danger bg-danger/10 hover:bg-danger/10',
          compact && 'lg:justify-center lg:gap-0 lg:px-2',
        )}
      >
        <LogOut size={18} />
        <span className={cn(compact && 'lg:hidden')}>{t('sidebar.signOut')}</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/5 bg-dark-950/95 px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white"
          aria-label={t('nav.toggleMenu')}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href={'/'} className="text-lg font-bold">
          <span className="text-primary-500">AURA</span>
          <span className="text-white"> TECH</span>
        </Link>
        {type === 'customer' ? (
          <div className="ms-auto">
            <NotificationBell audience="customer" />
          </div>
        ) : (
          <div className="ms-auto">
            <NotificationBell audience="admin" />
          </div>
        )}
      </div>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label={t('common.cancel')}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer (mobile) + static sidebar (desktop) */}
      <aside
        className={cn(
          'bg-dark-900 border-white/5 flex flex-col min-h-0 z-50',
          'fixed inset-y-0 start-0 w-72 max-w-[85vw] border-e transition-[transform,width] duration-200 ease-out',
          'lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-auto lg:max-w-none lg:translate-x-0 lg:transition-[width]',
          compact ? 'lg:w-[4.5rem]' : 'lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0',
        )}
      >
        <div className="relative shrink-0">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden absolute top-4 end-2 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
            aria-label={t('common.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
