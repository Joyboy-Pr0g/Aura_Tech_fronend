import { clientFetch } from '@/lib/api/client';
import { Product } from '@/lib/types/entities';
import {
  ProductReview,
  ProductQuestion,
  OrderStatusHistoryEntry,
} from '@/features/engagement/types';
import { assertContentAllowed } from '@/lib/moderation/check-content';

export async function getWishlist() {
  const res = await clientFetch<Product[]>('/api/wishlists');
  return res.data ?? [];
}

export async function addToWishlist(productId: string) {
  return clientFetch('/api/wishlists', {
    method: 'POST',
    body: { product_id: productId },
  });
}

export async function removeFromWishlist(productId: string) {
  return clientFetch(`/api/wishlists/${productId}`, { method: 'DELETE' });
}

export async function getProductReviews(productId: string, cursor?: string) {
  const res = await clientFetch<{
    items: ProductReview[];
    average_rating: number;
    rating_count: number;
  }>(`/api/products/${productId}/reviews`, {
    searchParams: { limit: 5, cursor },
  });
  return {
    items: res.data?.items ?? [],
    average_rating: res.data?.average_rating ?? 0,
    rating_count: res.data?.rating_count ?? 0,
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function getMyReviews() {
  const res = await clientFetch<ProductReview[]>('/api/reviews/my');
  return res.data ?? [];
}

export async function createReview(data: {
  product_id: string;
  order_item_id: string;
  rating: number;
  title: string;
  content: string;
}) {
  assertContentAllowed(data.title, data.content);

  const res = await clientFetch<ProductReview>('/api/reviews', {
    method: 'POST',
    body: data,
  });
  return res.data!;
}

export async function getProductQuestions(productId: string, cursor?: string) {
  const res = await clientFetch<ProductQuestion[]>(
    `/api/products/${productId}/questions`,
    { searchParams: { limit: 10, cursor } },
  );
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: res.has_more ?? false,
  };
}

export async function askQuestion(productId: string, question: string) {
  assertContentAllowed(question);

  const res = await clientFetch<ProductQuestion>(`/api/products/${productId}/questions`, {
    method: 'POST',
    body: { question },
  });
  return res.data!;
}

export async function getOrderStatusHistory(orderId: string) {
  const res = await clientFetch<OrderStatusHistoryEntry[]>(
    `/api/orders/my/${orderId}/history`,
  );
  return res.data ?? [];
}
