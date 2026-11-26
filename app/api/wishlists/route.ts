import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { revalidatePath } from 'next/cache';
import { expireTag } from '@/lib/storefront/revalidate';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: '/wishlists', method: 'GET' });
}

export async function POST(request: NextRequest) {
  const res = await proxyToBackend(request, { path: '/wishlists', method: 'POST' });
  expireTag('wishlist');
  expireTag('products');
  revalidatePath('/dashboard/wishlist');
  revalidatePath('/products');
  console.log(
    `[${new Date().toISOString()}] Revalidated: wishlist, products`
  );
  return res;
}
