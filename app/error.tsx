'use client';

import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="card-dark p-8 max-w-md text-center space-y-4">
        <h2 className="text-xl font-bold text-white">{t('error.title')}</h2>
        <p className="text-white/50 text-sm">{error.message || t('error.fallback')}</p>
        <button onClick={reset} className="btn-primary">
          {t('error.retry')}
        </button>
      </div>
    </main>
  );
}
