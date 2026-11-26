import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { revalidatePath } from 'next/cache';
import { expireTag } from '@/lib/storefront/revalidate';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const res = await proxyToBackend(request, {
    path: `/wishlists/${productId}`,
    method: 'DELETE',
  });
  expireTag('wishlist');
  expireTag('products');
  revalidatePath('/dashboard/wishlist');
  revalidatePath('/products');
  console.log(
    `[${new Date().toISOString()}] Revalidated: wishlist, products`
  );
  return res;
}
