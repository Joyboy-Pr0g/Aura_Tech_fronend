import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(request, { path: endpoints.admin.coupon(params.id), method: 'PUT' });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(_request, { path: endpoints.admin.coupon(params.id), method: 'DELETE' });
}
