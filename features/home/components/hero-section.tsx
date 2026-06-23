import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield, Headphones } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/features/home/components/search-bar';

const TRUST_ITEMS = [
  { icon: Truck, label: 'Nationwide Delivery' },
  { icon: Shield, label: 'Secure Payments' },
  { icon: Headphones, label: 'Expert Support' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/15 via-dark-950 to-dark-950" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-500/10 blur-3xl" />

      <Container className="relative py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Badge variant="default" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            Yemen&apos;s Premium Tech Store
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Tech that powers{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
                your ambition
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Discover laptops, smartphones, and accessories from top brands — curated for performance, value, and local support.
            </p>
          </div>

          <SearchBar size="large" className="max-w-2xl mx-auto" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ButtonLink href="/products" size="lg">
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/about" variant="outline" size="lg">
              Learn More
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/50">
                <Icon className="h-4 w-4 text-primary-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
