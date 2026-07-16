import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, {
    path: endpoints.auth.password,
    method: 'PATCH',
  });
}
