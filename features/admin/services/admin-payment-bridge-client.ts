import { clientFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { bffPath } from '@/lib/api/bff';
import { PaymentDevice, PaymentDeviceRegistered, PaymentProvider } from '@/lib/types/entities';

export interface RegisterPaymentDevicePayload {
  device_uuid: string;
  label?: string | null;
}

export interface UpdatePaymentDevicePayload {
  label?: string | null;
  enabled?: boolean;
}

export interface CreatePaymentProviderPayload {
  name: string;
  aliases?: string[];
  is_active?: boolean;
}

export type UpdatePaymentProviderPayload = Partial<CreatePaymentProviderPayload>;

export async function getAdminPaymentDevices(): Promise<PaymentDevice[]> {
  const res = await clientFetch<PaymentDevice[]>(bffPath(endpoints.admin.paymentBridgeDevices));
  return res.data ?? [];
}

export async function registerAdminPaymentDevice(
  data: RegisterPaymentDevicePayload,
): Promise<PaymentDeviceRegistered> {
  const res = await clientFetch<PaymentDeviceRegistered>(bffPath(endpoints.admin.paymentBridgeDevices), {
    method: 'POST',
    body: { ...data },
  });
  return res.data!;
}

export async function updateAdminPaymentDevice(
  id: string,
  data: UpdatePaymentDevicePayload,
): Promise<PaymentDevice> {
  const res = await clientFetch<PaymentDevice>(bffPath(endpoints.admin.paymentBridgeDevice(id)), {
    method: 'PATCH',
    body: { ...data },
  });
  return res.data!;
}

export async function deleteAdminPaymentDevice(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentBridgeDevice(id)), { method: 'DELETE' });
}

export async function getAdminPaymentProviders(): Promise<PaymentProvider[]> {
  const res = await clientFetch<PaymentProvider[]>(bffPath(endpoints.admin.paymentBridgeProviders));
  return res.data ?? [];
}

export async function createAdminPaymentProvider(
  data: CreatePaymentProviderPayload,
): Promise<PaymentProvider> {
  const res = await clientFetch<PaymentProvider>(bffPath(endpoints.admin.paymentBridgeProviders), {
    method: 'POST',
    body: { ...data },
  });
  return res.data!;
}

export async function updateAdminPaymentProvider(
  id: string,
  data: UpdatePaymentProviderPayload,
): Promise<PaymentProvider> {
  const res = await clientFetch<PaymentProvider>(bffPath(endpoints.admin.paymentBridgeProvider(id)), {
    method: 'PATCH',
    body: { ...data },
  });
  return res.data!;
}

export async function deleteAdminPaymentProvider(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.paymentBridgeProvider(id)), { method: 'DELETE' });
}
