import { clientFetch } from '@/lib/api/client';

export async function subscribeStockReminder(productId: string, variantId?: string | null) {
  await clientFetch(`/api/reminders/products/${productId}`, {
    method: 'POST',
    body: variantId ? { variant_id: variantId } : {},
  });
}
