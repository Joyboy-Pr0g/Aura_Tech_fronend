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
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

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
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  product: Product;
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

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  tax: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  items: OrderItem[];
  payment: Payment | null;
  customer?: User;
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
