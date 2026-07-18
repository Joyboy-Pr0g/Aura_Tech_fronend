import { getAdminPaymentsServer, getAdminPaymentMethodsServer } from '@/features/admin/services/admin-payments-server';
import { AdminPaymentsPanel } from '@/features/admin/components/payments/admin-payments-panel';

const PAGE_SIZE = 20;

interface AdminPaymentsContentProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    payment_method_id?: string;
    status?: string;
    min_amount?: string;
    max_amount?: string;
  }>;
}

export async function AdminPaymentsContent({ searchParams }: AdminPaymentsContentProps) {
  const params = await searchParams;
  const tab = params.tab === 'methods' ? 'methods' : 'payments';

  const [paymentsPage, methods] = await Promise.all([
    getAdminPaymentsServer({
      search: params.search?.trim() || undefined,
      payment_method_id: params.payment_method_id || undefined,
      status: params.status || undefined,
      min_amount: params.min_amount || undefined,
      max_amount: params.max_amount || undefined,
      limit: PAGE_SIZE,
    }),
    getAdminPaymentMethodsServer(),
  ]);

  return (
    <AdminPaymentsPanel
      initialPayments={paymentsPage}
      initialMethods={methods}
      initialTab={tab}
      initialSearch={params.search}
      initialPaymentMethodId={params.payment_method_id}
      initialStatus={params.status}
      initialMinAmount={params.min_amount}
      initialMaxAmount={params.max_amount}
    />
  );
}
