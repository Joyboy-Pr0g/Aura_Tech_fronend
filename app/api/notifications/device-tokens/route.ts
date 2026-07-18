import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function POST(request: NextRequest) {
  return proxyToBackend(request, {
    path: `${endpoints.notifications.root}/device-tokens`,
    method: 'POST',
  });
}
