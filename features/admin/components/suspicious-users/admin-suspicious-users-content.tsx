import { getAdminSuspiciousUsersServer } from '@/features/admin/services/admin-suspicious-users-server';
import { AdminSuspiciousUsersPanel } from '@/features/admin/components/suspicious-users/admin-suspicious-users-panel';

interface AdminSuspiciousUsersContentProps {
  searchParams?: {
    status?: string;
  };
}

export async function AdminSuspiciousUsersContent({ searchParams }: AdminSuspiciousUsersContentProps) {
  const initial = await getAdminSuspiciousUsersServer({
    status: searchParams?.status ?? 'open',
    limit: 20,
  });

  return (
    <AdminSuspiciousUsersPanel
      initial={initial}
      initialStatus={searchParams?.status ?? 'open'}
    />
  );
}
