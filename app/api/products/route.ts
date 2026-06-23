import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.products.root, method: 'GET' });
}
