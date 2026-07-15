import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: '/reviews/my', method: 'GET' });
}
