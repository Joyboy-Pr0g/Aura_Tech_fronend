'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { User as UserType } from '@/lib/types/entities';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

interface NavbarProps {
  user?: UserType | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dashboardHref = user?.role === 'customer' ? '/dashboard' : '/admin';

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/15 border border-primary-500/30">
              <ShoppingBag className="h-4 w-4 text-primary-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary-400">AURA</span>
              <span className="text-white"> TECH</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <ButtonLink href={dashboardHref} variant="outline" size="sm">
                <User className="h-4 w-4" />
                Dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Sign In
                </ButtonLink>
                <ButtonLink href="/register" size="sm">
                  Register
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-white/70 hover:bg-white/5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="lg:hidden border-t border-white/5 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 px-4 flex flex-col gap-2">
              {user ? (
                <ButtonLink href={dashboardHref} variant="outline" className="w-full">
                  Dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/login" variant="outline" className="w-full">
                    Sign In
                  </ButtonLink>
                  <ButtonLink href="/register" className="w-full">
                    Register
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
