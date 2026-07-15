'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <p className="text-white/50">{t('notFound.title')}</p>
        <Link href="/" className="btn-primary inline-flex">
          {t('notFound.goHome')}
        </Link>
      </div>
    </main>
  );
}
