import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { PaymentDevice, PaymentProvider } from '@/lib/types/entities';

export async function getAdminPaymentDevicesServer(): Promise<PaymentDevice[]> {
  const res = await serverFetch<PaymentDevice[]>(endpoints.admin.paymentBridgeDevices);
  return res.data ?? [];
}

export async function getAdminPaymentProvidersServer(): Promise<PaymentProvider[]> {
  const res = await serverFetch<PaymentProvider[]>(endpoints.admin.paymentBridgeProviders);
  return res.data ?? [];
}
