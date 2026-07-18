import { Suspense } from 'react';
import { AdminPaymentsContent } from '@/features/admin/components/payments/admin-payments-content';
import { PaymentsSkeleton } from '@/features/admin/skeletons/payments-skeleton';

interface AdminPaymentsPageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    payment_method_id?: string;
    status?: string;
    min_amount?: string;
    max_amount?: string;
  }>;
}

export default function AdminPaymentsPage(props: AdminPaymentsPageProps) {
  return (
    <Suspense fallback={<PaymentsSkeleton />}>
      <AdminPaymentsContent {...props} />
    </Suspense>
  );
}
