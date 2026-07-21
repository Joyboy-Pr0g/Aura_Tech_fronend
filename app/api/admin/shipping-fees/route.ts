import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { revalidateShippingFeesStorefront } from '@/lib/storefront/revalidate';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.shippingFees, method: 'GET' });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, {
    path: endpoints.admin.shippingFees,
    method: 'POST',
    revalidateOnSuccess: () => revalidateShippingFeesStorefront(),
  });
}
