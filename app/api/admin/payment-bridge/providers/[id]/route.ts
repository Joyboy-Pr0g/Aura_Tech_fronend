import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(request, {
    path: endpoints.admin.paymentBridgeProvider(params.id),
    method: 'PATCH',
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(_request, {
    path: endpoints.admin.paymentBridgeProvider(params.id),
    method: 'DELETE',
  });
}
