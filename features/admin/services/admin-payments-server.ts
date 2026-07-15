import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { CursorPage } from '@/lib/types/api';
import { AdminPayment, PaymentMethod } from '@/lib/types/entities';
import { parseAdminPaymentsPage } from '@/features/admin/lib/parse-admin-payments-page';

export async function getAdminPaymentsServer(params?: {
  order_id?: string;
  payment_method_id?: string;
  status?: string;
  min_amount?: string;
  max_amount?: string;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<AdminPayment>> {
  const res = await serverFetch<AdminPayment[]>(endpoints.admin.payments, { searchParams: params });
  return parseAdminPaymentsPage(res);
}

export async function getAdminPaymentMethodsServer(): Promise<PaymentMethod[]> {
  const res = await serverFetch<PaymentMethod[]>(endpoints.admin.paymentMethods);
  return res.data ?? [];
}
