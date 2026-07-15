'use client';

import { User } from '@/lib/types/entities';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SettingsViewProps {
  user: User;
}

export function SettingsView({ user }: SettingsViewProps) {
  const { t } = useLocale();

  return (
    <div className="p-8 space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
      <div className="card-dark p-5 space-y-3">
        <div>
          <p className="label-dark">{t('settings.fullName')}</p>
          <p className="text-white">{user.full_name}</p>
        </div>
        <div>
          <p className="label-dark">{t('settings.email')}</p>
          <p className="text-white">{user.email}</p>
        </div>
        <div>
          <p className="label-dark">{t('settings.role')}</p>
          <p className="text-white capitalize">{user.role?.replace('_', ' ')}</p>
        </div>
        <div>
          <p className="label-dark">{t('settings.status')}</p>
          <p className="text-success capitalize">{user.status}</p>
        </div>
      </div>
    </div>
  );
}
