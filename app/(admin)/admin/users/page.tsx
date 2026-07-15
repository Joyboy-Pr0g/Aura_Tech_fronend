import { Suspense } from 'react';
import { AdminUsersContent } from '@/features/admin/components/users/admin-users-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminUsersPageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    include_deleted?: string;
  }>;
}

export default function AdminUsersPage(props: AdminUsersPageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminUsersContent {...props} />
    </Suspense>
  );
}
