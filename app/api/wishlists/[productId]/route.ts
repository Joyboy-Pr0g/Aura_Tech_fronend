import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  return proxyToBackend(request, {
    path: `/wishlists/${productId}`,
    method: 'DELETE',
  });
}
