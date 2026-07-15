import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';

export async function POST(request: NextRequest) {
  return proxyToBackend(request, { path: '/reviews', method: 'POST' });
}
