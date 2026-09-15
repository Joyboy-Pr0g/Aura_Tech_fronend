import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  return proxyToBackend(request, {
    path: `${endpoints.admin.expensesTotals}${url.search}`,
    method: 'GET',
  });
}
