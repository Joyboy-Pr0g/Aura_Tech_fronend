'use client';

import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function ContactPage() {
  const { t } = useLocale();

  const CONTACT_INFO = [
    { icon: MapPin, labelKey: 'contact.address' as const, value: t('contact.addressValue') },
    { icon: Phone, labelKey: 'contact.phone' as const, value: t('contact.phoneValue') },
    { icon: Mail, labelKey: 'contact.email' as const, value: t('contact.emailValue') },
    { icon: Clock, labelKey: 'contact.hours' as const, value: t('contact.hoursValue') },
  ];

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="max-w-3xl mb-10">
          <Badge variant="secondary" className="mb-3">{t('contact.badge')}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{t('contact.title')}</h1>
          <p className="text-white/50 mt-2">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, labelKey, value }) => (
              <Card key={labelKey} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wide">{t(labelKey)}</p>
                    <p className="text-sm text-white mt-0.5">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t('contact.formTitle')}</CardTitle>
              <CardDescription>{t('contact.formDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.fullName')}</Label>
                    <Input id="name" placeholder={t('contact.namePlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.email')}</Label>
                    <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.subject')}</Label>
                  <Input id="subject" placeholder={t('contact.subjectPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.message')}</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={t('contact.messagePlaceholder')}
                    className="flex w-full rounded-xl border border-white/10 bg-dark-900/80 px-4 py-3 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 resize-none"
                  />
                </div>
                <Button type="button" className="w-full sm:w-auto">
                  {t('contact.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
