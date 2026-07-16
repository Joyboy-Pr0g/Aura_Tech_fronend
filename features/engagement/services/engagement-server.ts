import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Product } from '@/lib/types/entities';

export async function getWishlistServer(): Promise<Product[]> {
  const res = await serverFetch<Product[]>(endpoints.engagement.wishlists,{},['wishlist']);
  return res.data ?? [];
}
