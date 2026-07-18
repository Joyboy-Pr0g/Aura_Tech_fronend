import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { Product } from '@/lib/types/entities';
import { ProductReview } from '@/features/engagement/types';

export async function getWishlistServer(): Promise<Product[]> {
  const res = await serverFetch<Product[]>(endpoints.engagement.wishlists,{},['wishlist']);
  return res.data ?? [];
}

export async function getMyReviewsServer(): Promise<ProductReview[]> {
  const res = await serverFetch<ProductReview[]>(endpoints.engagement.reviewsMy);
  return res.data ?? [];
}
