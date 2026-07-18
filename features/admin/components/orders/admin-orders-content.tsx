import { getAdminOrdersServer } from '@/features/admin/services/admin-orders-server';
import { AdminOrdersPanel } from '@/features/admin/components/orders/admin-orders-panel';

const PAGE_SIZE = 20;

interface AdminOrdersContentProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export async function AdminOrdersContent({ searchParams }: AdminOrdersContentProps) {
  const params = await searchParams;

  const page = await getAdminOrdersServer({
    search: params.search?.trim() || undefined,
    status: params.status || undefined,
    limit: PAGE_SIZE,
  });

  return (
    <AdminOrdersPanel
      initial={page}
      initialSearch={params.search}
      initialStatus={params.status}
    />
  );
}
