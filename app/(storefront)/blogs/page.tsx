'use client';

import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function BlogsPage() {
  const { t } = useLocale();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mb-10">
          <Badge variant="secondary" className="mb-3">{t('blog.badge')}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{t('blog.title')}</h1>
          <p className="text-white/50 mt-2">{t('blog.subtitle')}</p>
        </div>

        <Card className="p-12 text-center">
          <p className="text-white/50">{t('blog.comingSoon')}</p>
        </Card>
      </Container>
    </div>
  );
}
