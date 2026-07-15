import { getAdminCategoriesServer } from '@/features/admin/services/admin-categories-server';
import { AdminCategoriesPanel } from '@/features/admin/components/categories/admin-categories-panel';

const PAGE_SIZE = 20;

interface AdminCategoriesContentProps {
  searchParams: Promise<{
    search?: string;
    is_active?: string;
    include_deleted?: string;
  }>;
}

export async function AdminCategoriesContent({ searchParams }: AdminCategoriesContentProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const is_active = params.is_active;
  const include_deleted = params.include_deleted;

  const page = await getAdminCategoriesServer({
    search,
    is_active,
    include_deleted,
    limit: PAGE_SIZE,
  });

  return (
    <AdminCategoriesPanel
      initial={page}
      initialSearch={search}
      initialStatus={is_active}
      initialIncludeDeleted={include_deleted === 'true'}
    />
  );
}
