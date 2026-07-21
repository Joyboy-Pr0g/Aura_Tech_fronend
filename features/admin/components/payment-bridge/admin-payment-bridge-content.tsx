import { getAdminPaymentDevicesServer, getAdminPaymentProvidersServer } from '@/features/admin/services/admin-payment-bridge-server';
import { AdminPaymentBridgePanel } from '@/features/admin/components/payment-bridge/admin-payment-bridge-panel';

interface AdminPaymentBridgeContentProps {
  searchParams?: {
    tab?: string;
  };
}

export async function AdminPaymentBridgeContent({ searchParams }: AdminPaymentBridgeContentProps) {
  const [devices, providers] = await Promise.all([
    getAdminPaymentDevicesServer(),
    getAdminPaymentProvidersServer(),
  ]);

  const initialTab = searchParams?.tab === 'providers' ? 'providers' : 'devices';

  return (
    <AdminPaymentBridgePanel
      initialDevices={devices}
      initialProviders={providers}
      initialTab={initialTab}
    />
  );
}
