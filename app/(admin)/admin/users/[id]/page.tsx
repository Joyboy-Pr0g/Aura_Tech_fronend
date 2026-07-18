import { Suspense } from 'react';
import { AdminUserDetailContent } from '@/features/admin/components/users/admin-user-detail-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminUserDetailContent id={id} />
    </Suspense>
  );
}
