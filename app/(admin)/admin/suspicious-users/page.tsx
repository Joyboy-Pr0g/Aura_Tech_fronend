import { AdminSuspiciousUsersContent } from '@/features/admin/components/suspicious-users/admin-suspicious-users-content';

interface AdminSuspiciousUsersPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function AdminSuspiciousUsersPage({ searchParams }: AdminSuspiciousUsersPageProps) {
  const params = searchParams ? await searchParams : undefined;
  return <AdminSuspiciousUsersContent searchParams={params} />;
}
