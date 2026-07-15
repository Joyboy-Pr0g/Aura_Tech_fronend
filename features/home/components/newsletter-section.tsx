'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';

export function NewsletterSection() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast(t('home.newsletterThanks'), 'success');
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-16 border-t border-white/5">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-dark-900 to-secondary-500/10 p-8 lg:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,217,255,0.08),transparent_60%)]" />
          <div className="relative max-w-xl mx-auto space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/15 border border-primary-500/30 mx-auto">
              <Mail className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">{t('home.newsletterTitle')}</h2>
              <p className="text-white/50 mt-2">
                {t('home.newsletterDescLong')}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                className="flex-1 bg-dark-950/80"
              />
              <Button type="submit" disabled={loading} className="shrink-0">
                {loading ? t('home.subscribing') : t('home.subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
