'use client';

import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Shield, Truck, Users, Zap } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

const VALUES = [
  {
    icon: Zap,
    titleKey: 'about.values.tech.title' as const,
    descKey: 'about.values.tech.desc' as const,
  },
  {
    icon: Truck,
    titleKey: 'about.values.delivery.title' as const,
    descKey: 'about.values.delivery.desc' as const,
  },
  {
    icon: Shield,
    titleKey: 'about.values.secure.title' as const,
    descKey: 'about.values.secure.desc' as const,
  },
  {
    icon: Users,
    titleKey: 'about.values.local.title' as const,
    descKey: 'about.values.local.desc' as const,
  },
];

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="max-w-3xl mb-14">
          <Badge variant="secondary" className="mb-3">{t('about.badge')}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            {t('about.title')}
          </h1>
          <p className="text-lg text-white/50 mt-4 leading-relaxed">
            {t('about.intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {VALUES.map(({ icon: Icon, titleKey, descKey }) => (
            <Card key={titleKey} className="p-6">
              <div className="h-11 w-11 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{t(descKey)}</p>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-4">{t('about.missionTitle')}</h2>
              <p className="text-white/50 leading-relaxed mb-6">
                {t('about.missionBody')}
              </p>
              <ButtonLink href="/products">{t('about.cta')}</ButtonLink>
            </CardContent>
            <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary-500/20 via-dark-900 to-secondary-500/10 flex items-center justify-center">
              <span className="text-8xl opacity-30">⚡</span>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
