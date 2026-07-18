import { Product, User } from '@/lib/types/entities';

export interface AdminQuestionAnswer {
  id: string;
  answer: string;
  is_seller_answer: boolean;
  created_at: string;
  answered_by?: Pick<User, 'id' | 'full_name'>;
}

export interface AdminProductQuestion {
  id: string;
  question: string;
  product_id: string;
  customer_id: string;
  helpful_count: number;
  is_published: boolean;
  created_at: string;
  product?: Pick<Product, 'id' | 'title' | 'slug'>;
  customer?: Pick<User, 'id' | 'full_name' | 'email'>;
  answers: AdminQuestionAnswer[];
}

export interface AdminProductReview {
  id: string;
  product_id: string;
  title: string;
  content: string;
  moderation_status: string;
  is_verified_purchase: boolean;
  created_at: string;
  product?: Pick<Product, 'id' | 'title' | 'slug'>;
  rating?: { id: string; rating: number } | null;
}
