'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, LogOut, Package, Settings, LayoutDashboard, ChevronDown, Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserType } from '@/lib/types/entities';
import { logout } from '@/features/auth/services/auth-service';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Button } from '@/components/ui/button';

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const dashboardHref = user.role === 'customer' ? '/dashboard' : '/admin';
  const ordersHref = user.role === 'customer' ? '/dashboard/orders' : '/admin/orders';
  const settingsHref = user.role === 'customer' ? '/dashboard/profile' : '/admin/profile';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // redirect anyway
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[100px] truncate hidden sm:inline">
            {user.full_name || user.email.split('@')[0]}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-dark-900 border-white/10">
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard')}
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin/payments" className="flex items-center gap-2 cursor-pointer">
              <Package className="h-4 w-4" /> {t('nav.payments')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={ordersHref} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" /> {user.role === 'customer' ? t('nav.orders') : t('nav.admin_orders')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsHref} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" /> {user.role === 'customer' ? t('nav.settings') : t('nav.settings_admin')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        >
          <Globe className="h-4 w-4" />
          {locale === 'en' ? 'العربية' : 'English'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="flex items-center gap-2 text-danger cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
