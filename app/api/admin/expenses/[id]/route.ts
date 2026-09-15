import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(request, {
    path: endpoints.admin.expense(params.id),
    method: 'PATCH',
  });
}
