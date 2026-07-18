import { getSession } from '@/lib/auth/session';
import { ProfileView } from '@/features/auth/components/profile-view';

export default async function ProfilePage() {
  const user = await getSession();
  return <ProfileView user={user!} />;
}
