import { getAdminRefundRequestsServer } from '@/features/refunds/services/refunds-server';
import { AdminRefundsPanel } from '@/features/admin/components/refunds/admin-refunds-panel';

interface AdminRefundsContentProps {
  searchParams?: {
    status?: string;
    order_number?: string;
  };
}

export async function AdminRefundsContent({ searchParams }: AdminRefundsContentProps) {
  const initial = await getAdminRefundRequestsServer({
    status: searchParams?.status,
    order_number: searchParams?.order_number,
    limit: 20,
  });

  return (
    <AdminRefundsPanel
      initial={initial}
      initialStatus={searchParams?.status}
      initialOrderNumber={searchParams?.order_number}
    />
  );
}
