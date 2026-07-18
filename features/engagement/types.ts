import { Product, User } from '@/lib/types/entities';

export interface ProductReview {
  id: string;
  product_id: string;
  order_item_id?: string;
  customer_id: string;
  title: string;
  content: string;
  helpful_count: number;
  moderation_status: string;
  is_verified_purchase: boolean;
  created_at: string;
  customer?: Pick<User, 'id' | 'full_name'>;
  rating?: { id: string; rating: number } | null;
  product?: Product;
}

export interface ProductReviewsResult {
  items: ProductReview[];
  average_rating: number;
  rating_count: number;
  next_cursor?: string | null;
  has_more?: boolean;
}

export interface QuestionAnswer {
  id: string;
  answer: string;
  is_seller_answer: boolean;
  created_at: string;
  answered_by?: Pick<User, 'id' | 'full_name'>;
}

export interface ProductQuestion {
  id: string;
  question: string;
  helpful_count: number;
  is_published?: boolean;
  created_at: string;
  customer?: Pick<User, 'id' | 'full_name'>;
  answers: QuestionAnswer[];
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  change_reason: string | null;
  notes: string | null;
  created_at: string;
}
