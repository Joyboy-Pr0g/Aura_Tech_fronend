import type { PaymentStatus } from '@/lib/types/entities';
import type { DashboardAnalytics } from '@/features/admin/services/admin-dashboard-server';

export type InventoryReason =
  | 'order_placed'
  | 'order_cancelled'
  | 'order_delivered'
  | 'restock'
  | 'return_received'
  | 'adjustment';

export interface RevenueByDayRow {
  day: string;
  revenue: number;
  order_count: number;
}

export interface TopProductRow {
  id: string;
  title: string;
  sales: number;
  revenue: number;
}

export interface CustomerMetrics {
  total_customers: number;
  paying_customers: number;
  avg_order_value: number;
}

export interface TopCustomerRow {
  customer_id: string;
  email: string;
  full_name: string | null;
  order_count: number;
  lifetime_value: number;
}

export interface InventoryStatus {
  total_products: number;
  low_stock: number;
  out_of_stock: number;
}

export interface InventoryTurnoverRow {
  product_id: string;
  title: string;
  sold_quantity: number;
  current_stock: number;
  turnover_rate: number;
}

export interface PaymentStatusSummary {
  pending_count: number;
  approved_today: number;
  payments_received_today: number;
  payments_received_total: number;
  expenses_today: number;
  expenses_total: number;
  expenses_company_total: number;
  expenses_refund_total: number;
  net_profit_total: number;
  total_revenue: number;
}

export interface FinancialPeriodSummary {
  payments_received: number;
  expenses_total: number;
  expenses_company: number;
  expenses_refund: number;
  net_profit: number;
}

export interface ExpenseHistoryRow {
  id: string;
  type: 'expense' | 'refund';
  amount: number;
  reason: string;
  receipt_url: string;
  created_at: string;
  order_number: string | null;
}

export interface InventoryLogRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity_change: number;
  reason: InventoryReason;
  reference_id: string | null;
  changed_by_id: string | null;
  notes: string | null;
  created_at: string;
  product?: { id: string; title: string; slug?: string };
  changed_by?: { id: string; full_name: string; email: string } | null;
}

export interface PaymentHistoryRow {
  id: string;
  order_id: string;
  order_number: string;
  amount: number | string;
  status: PaymentStatus;
  submitted_at: string;
  approved_at: string | null;
  rejected_at: string | null;
}

export interface CustomerAnalyticsResponse {
  metrics: CustomerMetrics;
  top_customers: TopCustomerRow[];
}

export type { DashboardAnalytics };
