'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { HomePageBackground } from '@/components/backgrounds/home-page-background';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getDevErrorMessage } from '@/lib/errors/user-facing-message';
import { DEFAULT_WEBSITE_LOGO, formatWhatsappLink } from '@/lib/website-settings/defaults';

const SUPPORT_WHATSAPP = '+967770584331';

interface StorefrontErrorPageProps {
  error: Error & { digest?: string };
  reset?: () => void;
  /** Full-screen layout when the root error boundary catches the failure */
  fullPage?: boolean;
}

export function StorefrontErrorPage({ error, reset, fullPage = false }: StorefrontErrorPageProps) {
  const { t } = useLocale();
  const devMessage = getDevErrorMessage(error);

  const content = (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="relative mb-8 h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(0,217,255,0.12)]">
        <Image
          src={DEFAULT_WEBSITE_LOGO}
          alt="AuraTech"
          fill
          priority
          className="object-cover"
          sizes="80px"
        />
      </div>

      <Badge className="mb-5 gap-1.5 px-3 py-1">
        <AlertCircle className="h-3.5 w-3.5" />
        {t('storefront.error.badge')}
      </Badge>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t('storefront.error.title')}
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
        {t('storefront.error.description')}
      </p>

      {devMessage ? (
        <p className="mt-4 max-w-md rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left text-xs text-amber-200/90">
          {devMessage}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {reset ? (
          <Button type="button" onClick={reset} className="min-w-[140px]">
            <RefreshCw className="h-4 w-4" />
            {t('storefront.error.retry')}
          </Button>
        ) : null}
        <ButtonLink href="/" variant="outline" className="min-w-[140px]">
          <Home className="h-4 w-4" />
          {t('storefront.error.goHome')}
        </ButtonLink>
      </div>

      <p className="mt-8 text-sm text-white/40">
        {t('storefront.error.support')}{' '}
        <Link
          href={formatWhatsappLink(SUPPORT_WHATSAPP)}
          target="_blank"
          rel="noreferrer"
          className="text-primary-400 underline-offset-4 hover:underline"
        >
          WhatsApp
        </Link>
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <HomePageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">{content}</div>
      </div>
    );
  }

  return content;
}
