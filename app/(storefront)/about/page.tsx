'use client';

import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Shield, Truck, Users, Zap } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Reveal, SlideIn, Stagger, staggerItemVariants, EASE_OUT_EXPO } from '@/lib/motion/reveal';
import { motion } from 'framer-motion';

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
        <Reveal className="max-w-3xl mb-14">
          <Badge variant="secondary" className="mb-3">{t('about.badge')}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            {t('about.title')}
          </h1>
          <p className="text-lg text-white/50 mt-4 leading-relaxed">
            {t('about.intro')}
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {VALUES.map(({ icon: Icon, titleKey, descKey }) => (
            <motion.div key={titleKey} variants={staggerItemVariants}>
              <Card className="p-6 h-full transition-colors hover:border-primary-500/30 hover:bg-primary-500/[0.03]">
                <div className="h-11 w-11 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{t(descKey)}</p>
              </Card>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <SlideIn fromStart className="flex flex-col justify-center">
                <CardContent className="p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-white mb-4">{t('about.missionTitle')}</h2>
                  <p className="text-white/50 leading-relaxed mb-6">
                    {t('about.missionBody')}
                  </p>
                  <ButtonLink href="/products">{t('about.cta')}</ButtonLink>
                </CardContent>
              </SlideIn>
              <SlideIn fromStart={false} delay={0.12}>
                <div className="aspect-video lg:aspect-auto lg:min-h-full bg-gradient-to-br from-primary-500/20 via-dark-900 to-secondary-500/10 flex items-center justify-center">
                  <motion.span
                    className="text-8xl opacity-30"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ⚡
                  </motion.span>
                </div>
              </SlideIn>
            </div>
          </Card>
        </Reveal>
      </Container>
    </div>
  );
}
