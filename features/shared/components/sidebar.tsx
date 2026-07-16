'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { User } from '@/lib/types/entities';
import { logout } from '@/features/auth/services/auth-service';
import {
  ShoppingCart, Package, MapPin, Settings,
  LayoutDashboard, Users, ClipboardList, Banknote, LogOut, Heart, Star,
  Menu, X,
  ListIcon, Truck,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
}

const CUSTOMER_NAV: NavItem[] = [
  { key: 'sidebar.dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'sidebar.orders', href: '/dashboard/orders', icon: <Package size={18} /> },
  { key: 'sidebar.cart', href: '/cart', icon: <ShoppingCart size={18} /> },
  { key: 'sidebar.wishlist', href: '/dashboard/wishlist', icon: <Heart size={18} /> },
  { key: 'sidebar.reviews', href: '/dashboard/reviews', icon: <Star size={18} /> },
  { key: 'sidebar.addresses', href: '/dashboard/addresses', icon: <MapPin size={18} /> },
  { key: 'sidebar.settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { key: 'sidebar.dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { key: 'sidebar.users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'sidebar.categories', href: '/admin/categories', icon: <ListIcon size={18} /> },
  { key: 'sidebar.products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'sidebar.adminOrders', href: '/admin/orders', icon: <ClipboardList size={18} /> },
  { key: 'sidebar.shippingFees', href: '/admin/shipping-fees', icon: <Truck size={18} /> },
  { key: 'sidebar.payments', href: '/admin/payments', icon: <Banknote size={18} /> },
];

interface SidebarProps {
  type: 'customer' | 'admin';
  user: User;
}

export function Sidebar({ type, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const navItems = type === 'customer' ? CUSTOMER_NAV : ADMIN_NAV;

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
    <div className="px-6 py-5 border-b border-white/5">
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
  );

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn('sidebar-item', isActive && 'sidebar-item-active')}
          >
            {item.icon}
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="px-3 py-4 border-t border-white/5 shrink-0">
      <div className="px-4 py-2 mb-2">
        <p className="text-sm font-medium text-white/80 truncate">{user.full_name || user.email}</p>
        <p className="text-xs text-white/30 capitalize">{user.role?.replace('_', ' ')}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="sidebar-item w-full text-danger hover:text-danger bg-danger/10 hover:bg-danger/10"
      >
        <LogOut size={18} />
        {t('sidebar.signOut')}
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
        <Link href={type === 'admin' ? '/admin' : '/dashboard'} className="text-lg font-bold">
          <span className="text-primary-500">AURA</span>
          <span className="text-white"> TECH</span>
        </Link>
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
          'bg-dark-900 border-white/5 flex flex-col z-50',
          'fixed inset-y-0 start-0 w-72 max-w-[85vw] border-e transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:transition-none',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between lg:block">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden absolute top-5 end-0 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
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
