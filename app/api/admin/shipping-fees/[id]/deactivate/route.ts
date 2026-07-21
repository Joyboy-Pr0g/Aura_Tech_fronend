import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { revalidateShippingFeesStorefront } from '@/lib/storefront/revalidate';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.shippingFeeAction(id, 'deactivate'),
    method: 'POST',
    revalidateOnSuccess: () => revalidateShippingFeesStorefront(),
  });
}
