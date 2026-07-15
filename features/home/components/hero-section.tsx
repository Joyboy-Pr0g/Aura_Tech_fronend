'use client';

import { ArrowRight, Sparkles, Truck, Shield, Headphones } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/features/home/components/search-bar';
import { useLocale } from '@/lib/i18n/locale-provider';

const TRUST_ITEMS = [
  { icon: Truck, key: 'home.trust.delivery' as const },
  { icon: Shield, key: 'home.trust.payments' as const },
  { icon: Headphones, key: 'home.trust.support' as const },
];

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-[85vh] flex items-center">
      <Container className="relative py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Badge variant="default" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            {t('home.badge')}
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {t('home.welcome')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#0066FF]">
                AURA TECH
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              {t('home.heroDesc')}
            </p>
          </div>

          <SearchBar size="large" className="max-w-2xl mx-auto" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ButtonLink href="/products" size="md">
              {t('home.shopNow')}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/products" variant="outline" size="md">
              {t('home.browseCategories')}
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {TRUST_ITEMS.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2 text-sm text-white/50">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Icon className="h-4 w-4 text-[#00D9FF]" />
                  {t(key)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
