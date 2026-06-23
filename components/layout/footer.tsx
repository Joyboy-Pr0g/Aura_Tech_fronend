import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category_id=laptops', label: 'Laptops' },
    { href: '/products?category_id=smartphones', label: 'Smartphones' },
    { href: '/products?category_id=accessories', label: 'Accessories' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/blogs', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Register' },
    { href: '/dashboard', label: 'My Account' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900/50">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block text-xl font-bold">
              <span className="text-primary-400">AURA</span>
              <span className="text-white"> TECH</span>
            </Link>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              Premium technology products delivered across Yemen. Laptops, phones, accessories, and expert support — all in one place.
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-400 shrink-0" />
                Sana&apos;a, Yemen
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

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-primary-400 transition-colors"
                    >
                      {link.label}
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
            © {new Date().getFullYear()} AURA TECH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Facebook, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-white/40 hover:text-primary-400 transition-colors"
                aria-label="Social link"
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
