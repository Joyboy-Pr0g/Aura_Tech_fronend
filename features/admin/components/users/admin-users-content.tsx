import { getAdminUsersServer } from '@/features/admin/services/admin-users-server';
import { AdminUsersPanel } from '@/features/admin/components/users/admin-users-panel';
import { Role } from '@/lib/types/entities';

const PAGE_SIZE = 20;

interface AdminUsersContentProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    include_deleted?: string;
  }>;
}

export async function AdminUsersContent({ searchParams }: AdminUsersContentProps) {
  const params = await searchParams;
  const role = params.role as Role | undefined;
  const search = params.search?.trim() || undefined;
  const includeDeleted = params.include_deleted;
  const page = await getAdminUsersServer({
    role,
    search,
    limit: PAGE_SIZE,
    include_deleted: includeDeleted,
  });

  return (
    <AdminUsersPanel
      initial={page}
      initialRole={role}
      initialSearch={search}
    />
  );
}
