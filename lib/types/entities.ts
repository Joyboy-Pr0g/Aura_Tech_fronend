export type Role = 'admin' | 'sub_admin' | 'customer';
export type UserStatus = 'active' | 'blocked';
export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'manual_approved';
export type OrderPaymentType = 'bank_transfer' | 'pay_on_delivery';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_category_id: string | null;
  children: Category[];
}


export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  image_url: string | null;
  image_public_id: string | null;
  parent_category_id: string | null;
  product_count: number;
  deleted_at: string | null;
  children: AdminCategory[];
}

export interface ProductImage {
  url: string;
  public_id: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock_quantity: number;
  reserved_quantity: number;
  images?: ProductImage[] | null;
}

export interface ProductReviewSummary {
  id: string;
  product_id: string;
  title: string;
  content: string;
  helpful_count: number;
  moderation_status: string;
  is_verified_purchase: boolean;
  created_at: string;
  customer?: Pick<User, 'id' | 'full_name'>;
  rating?: { id: string; rating: number } | null;
}

export interface ProductQuestionSummary {
  id: string;
  question: string;
  helpful_count: number;
  created_at: string;
  customer?: Pick<User, 'id' | 'full_name'>;
  answers: Array<{
    id: string;
    answer: string;
    is_seller_answer: boolean;
    created_at: string;
    answered_by?: Pick<User, 'id' | 'full_name'>;
  }>;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  features: Record<string, string>;
  stock_quantity: number;
  reserved_quantity: number;
  images: ProductImage[];
  category: Category;
  sub_category?: Category | null;
  variants?: ProductVariant[];
  is_wishlisted?: boolean;
  reviews?: ProductReviewSummary[];
  questions?: ProductQuestionSummary[];
  average_rating?: number;
  rating_count?: number;
  created_at: string;
}

export interface ProductBrand {
  brand: string;
}

export interface AdminProduct extends Product {
  deleted_at: string | null;
  category_id: string;
  sub_category_id?: string | null;
  sub_category?: Category | null;
  created_by?: Pick<User, 'id' | 'email' | 'full_name'> | null;
  updated_by?: Pick<User, 'id' | 'email' | 'full_name'> | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_time: number;
  product: Product;
  variant?: ProductVariant | null;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
  expires_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  product: Product;
  variant?: ProductVariant | null;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method_id?: string | null;
  status: PaymentStatus;
  receipt_document_url: string | null;
  submitted_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  submitted_by_customer_id?: string;
  approved_by_admin_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  order?: Pick<Order, 'id' | 'order_number' | 'status' | 'total'>;
  payment_method?: PaymentMethod | null;
  submitted_by_customer?: User;
  approved_by_admin?: User;
}

export type AdminPayment = Payment;

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  expires_at: string | null;
  is_active: boolean;
  category_id?: string | null;
  sub_category_id?: string | null;
  product_id?: string | null;
  category?: Category | null;
  sub_category?: Category | null;
  product?: Pick<Product, 'id' | 'title' | 'slug'> | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLatestAction {
  entity_id: string;
  action: string;
  admin_email: string | null;
  admin_name: string | null;
  created_at: string;
}

export type RefundRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RefundRequest {
  id: string;
  order_id: string;
  customer_id: string;
  reason: string;
  image_url: string | null;
  status: RefundRequestStatus;
  processed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  order?: Pick<Order, 'id' | 'order_number' | 'total' | 'status'>;
  customer?: Pick<User, 'id' | 'full_name' | 'email'>;
  processed_by_admin?: Pick<User, 'id' | 'full_name' | 'email'> | null;
}

export type ExpenseType = 'expense' | 'refund';

export interface Expense {
  id: string;
  type: ExpenseType;
  order_id: string | null;
  amount: number;
  receipt_url: string;
  reason: string;
  created_by_admin_id: string;
  created_at: string;
  order?: Pick<Order, 'id' | 'order_number'> | null;
  created_by_admin?: Pick<User, 'id' | 'full_name' | 'email'>;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_type?: OrderPaymentType;
  subtotal: number;
  discount_total: number;
  tax: number;
  shipping_cost: number;
  shipping_fee_id?: string | null;
  shipping_fee?: ShippingFee | null;
  total: number;
  notes: string | null;
  items: OrderItem[];
  payment: Payment | null;
  customer?: User;
  shipping_address?: CustomerAddress | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  governorate: string;
  district: string | null;
  street_address: string;
  postal_code: string | null;
  country?: string;
  type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  bank_name: string;
  account_number: string | null;
  iban: string | null;
  description: string | null;
  is_active: boolean;
}

export type NotificationType =
  | 'order_confirmation'
  | 'payment_approved'
  | 'payment_rejected'
  | 'order_status_updated'
  | 'shipment_ready'
  | 'delivery_confirmation'
  | 'product_available'
  | 'staff_new_order'
  | 'staff_payment_submitted'
  | 'staff_refund_request'
  | 'question_answered';

export type NotificationDeliveryStatus = 'pending' | 'sent' | 'failed';

export interface AppNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_order_id: string | null;
  related_order_number: string | null;
  related_product_slug: string | null;
  status: NotificationDeliveryStatus;
  read_at: string | null;
  created_at: string;
}

export interface ShippingFee {
  id: string;
  price: number;
  duration: string;
  delivery_way: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WebsiteSettings {
  id: string;
  title: string;
  header_logo_public_id: string | null;
  header_logo_url: string | null;
  footer_logo_public_id: string | null;
  footer_logo_url: string | null;
  website_email: string | null;
  website_phone: string | null;
  facebook: string | null;
  instagram: string | null;
  whatsapp: string | null;
  tiktok: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  site_url: string | null;
  favicon_public_id: string | null;
  favicon_url: string | null;
  og_image_public_id: string | null;
  og_image_url: string | null;
  twitter_card: string | null;
  twitter_handle: string | null;
  default_locale: string | null;
  theme_color: string | null;
  robots: string | null;
  sar_to_yer: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_public_id: string | null;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string | null;
  author?: Pick<User, 'id' | 'full_name' | 'email'> | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentDevice {
  id: string;
  device_uuid: string;
  label: string | null;
  enabled: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentDeviceRegistered extends PaymentDevice {
  api_key: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  aliases: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
