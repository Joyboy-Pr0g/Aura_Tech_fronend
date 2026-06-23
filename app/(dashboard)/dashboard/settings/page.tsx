import { getSession } from '@/lib/auth/session';
import { SettingsView } from '@/features/auth/components/settings-view';

export default async function SettingsPage() {
  const user = await getSession();
  return <SettingsView user={user!} />;
}
