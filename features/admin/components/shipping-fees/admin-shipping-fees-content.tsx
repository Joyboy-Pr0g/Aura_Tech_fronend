import { getAdminShippingFeesServer } from '@/features/admin/services/admin-shipping-fees-server';
import { AdminShippingFeesPanel } from '@/features/admin/components/shipping-fees/admin-shipping-fees-panel';

export async function AdminShippingFeesContent() {
  const fees = await getAdminShippingFeesServer();
  return <AdminShippingFeesPanel initialFees={fees} />;
}
