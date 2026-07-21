import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { revalidateShippingFeesStorefront } from '@/lib/storefront/revalidate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.shippingFee(id), method: 'GET' });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.shippingFee(id),
    method: 'PUT',
    revalidateOnSuccess: () => revalidateShippingFeesStorefront(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.shippingFee(id),
    method: 'DELETE',
    revalidateOnSuccess: () => revalidateShippingFeesStorefront(),
  });
}
