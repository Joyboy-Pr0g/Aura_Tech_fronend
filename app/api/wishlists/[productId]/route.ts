import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const res = await proxyToBackend(request, {
    path: `/wishlists/${productId}`,
    method: 'DELETE',
  });
  revalidateTag('wishlist');
  revalidateTag('products');
  revalidatePath('/dashboard/wishlist');
  revalidatePath('/products');
  console.log(
    `[${new Date().toISOString()}] Revalidated: wishlist, products`
  );
  return res;
}
