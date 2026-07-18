import { Suspense } from 'react';
import { AdminWebsiteSettingsContent } from '@/features/admin/components/settings/admin-website-settings-content';

function WebsiteSettingsFallback() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-8">
      <div className="h-10 w-64 rounded-lg bg-white/5" />
      <div className="card-dark h-48" />
      <div className="card-dark h-32" />
      <div className="card-dark h-56" />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<WebsiteSettingsFallback />}>
      <AdminWebsiteSettingsContent />
    </Suspense>
  );
}
