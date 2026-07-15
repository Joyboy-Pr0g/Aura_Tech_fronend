import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { CursorPage } from '@/lib/types/api';
import { AdminPayment, PaymentMethod } from '@/lib/types/entities';
import { parseAdminPaymentsPage } from '@/features/admin/lib/parse-admin-payments-page';

export interface CreatePaymentMethodPayload {
  name: string;
  bank_name: string;
  account_number?: string;
  iban?: string;
  description?: string;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  bank_name?: string;
  account_number?: string;
  iban?: string;
  description?: string;
  is_active?: boolean;
}

export async function getAdminPayments(params?: {
  order_id?: string;
  payment_method_id?: string;
  status?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
  cursor?: string;
}): Promise<CursorPage<AdminPayment>> {
  const res = await clientFetch<AdminPayment[]>(bffPath(endpoints.admin.payments), { searchParams: params });
  return parseAdminPaymentsPage(res);
}

export async function getAdminPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await clientFetch<PaymentMethod[]>(bffPath(endpoints.admin.paymentMethods));
  return res.data ?? [];
}

export async function createAdminPaymentMethod(data: CreatePaymentMethodPayload): Promise<PaymentMethod> {
  const res = await clientFetch<PaymentMethod>(bffPath(endpoints.admin.paymentMethods), {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function updateAdminPaymentMethod(id: string, data: UpdatePaymentMethodPayload): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentMethod(id)), {
    method: 'PUT',
    body: data,
  });
}

export async function deleteAdminPaymentMethod(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentMethod(id)), { method: 'DELETE' });
}

export async function approveAdminPayment(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentApprove(id)), { method: 'PATCH' });
}

export async function rejectAdminPayment(id: string, reason: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentReject(id)), {
    method: 'PATCH',
    body: { reason },
  });
}
