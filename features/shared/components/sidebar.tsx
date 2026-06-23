'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { User } from '@/lib/types/entities';
import { logout } from '@/features/auth/services/auth-service';
import {
  ShoppingCart, Package, CreditCard, MapPin, Settings,
  LayoutDashboard, Users, ClipboardList, Banknote, LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My Orders', href: '/dashboard/orders', icon: <Package size={18} /> },
  { label: 'Cart', href: '/dashboard/cart', icon: <ShoppingCart size={18} /> },
  { label: 'Addresses', href: '/dashboard/addresses', icon: <MapPin size={18} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Payments', href: '/admin/payments', icon: <Banknote size={18} /> },
  { label: 'Orders', href: '/admin/orders', icon: <ClipboardList size={18} /> },
  { label: 'Products', href: '/admin/products', icon: <Package size={18} /> },
  { label: 'Users', href: '/admin/users', icon: <Users size={18} /> },
];

interface SidebarProps {
  type: 'customer' | 'admin';
  user: User;
}

export function Sidebar({ type, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = type === 'customer' ? CUSTOMER_NAV : ADMIN_NAV;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Still redirect on failure
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 min-h-screen bg-dark-900 border-r border-white/5 flex flex-col">
      <div className="px-6 py-5 border-b border-white/5">
        <h1 className="text-xl font-bold">
          <span className="text-primary-500">AURA</span>{' '}
          <span className="text-white">TECH</span>
        </h1>
        <p className="text-xs text-white/30 mt-0.5">
          {type === 'admin' ? 'Admin Panel' : 'Customer Portal'}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-item', isActive && 'sidebar-item-active')}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-white/80 truncate">{user.full_name || user.email}</p>
          <p className="text-xs text-white/30 capitalize">{user.role?.replace('_', ' ')}</p>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full text-danger hover:text-danger bg-danger/10 hover:bg-danger/10">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
