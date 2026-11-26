import { Suspense } from 'react';
import { AdminPaymentBridgeContent } from '@/features/admin/components/payment-bridge/admin-payment-bridge-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminPaymentBridgePageProps {
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default async function AdminPaymentBridgePage({ searchParams }: AdminPaymentBridgePageProps) {
  const params = searchParams ? await searchParams : undefined;
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminPaymentBridgeContent searchParams={params} />
    </Suspense>
  );
}
