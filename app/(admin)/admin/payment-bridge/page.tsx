import { Suspense } from 'react';
import { AdminPaymentBridgeContent } from '@/features/admin/components/payment-bridge/admin-payment-bridge-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminPaymentBridgePageProps {
  searchParams?: {
    tab?: string;
  };
}

export default function AdminPaymentBridgePage({ searchParams }: AdminPaymentBridgePageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminPaymentBridgeContent searchParams={searchParams} />
    </Suspense>
  );
}
