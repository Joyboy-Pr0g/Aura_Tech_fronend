import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: '/wishlists', method: 'GET' });
}

export async function POST(request: NextRequest) {
  const res = await proxyToBackend(request, { path: '/wishlists', method: 'POST' });
  revalidateTag('wishlists');
  return res;
}
