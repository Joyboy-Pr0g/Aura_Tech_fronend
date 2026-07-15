import { Suspense } from 'react';
import { AdminCategoriesContent } from '@/features/admin/components/categories/admin-categories-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminCategoriesPageProps {
  searchParams: Promise<{
    search?: string;
    is_active?: string;
    include_deleted?: string;
  }>;
}

export default function AdminCategoriesPage(props: AdminCategoriesPageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminCategoriesContent {...props} />
    </Suspense>
  );
}
