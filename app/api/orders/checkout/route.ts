import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { revalidateOrderProductsStorefront } from '@/lib/storefront/revalidate';
import type { Order } from '@/lib/types/entities';

export async function POST(request: NextRequest) {
  return proxyToBackend(request, {
    path: endpoints.orders.checkout,
    method: 'POST',
    revalidateOnSuccess: (data) => {
      if (data && typeof data === 'object') {
        revalidateOrderProductsStorefront(data as Order);
      }
    },
  });
}
