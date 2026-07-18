import { serverFetch } from '@/lib/api/server';

export interface DashboardAnalytics {
  revenue_today: number;
  orders_today: number;
  revenue_week: number;
  payments_received_today: number;
  payments_received_week: number;
  expenses_today: number;
  expenses_week: number;
  profit_today: number;
  profit_week: number;
  top_products: Array<{ id: string; title: string; sales: number; revenue: number }>;
  top_customers: Array<{ customer_id: string; email: string; full_name: string | null; order_count: number; lifetime_value: number }>;
  customer_metrics: { total_customers: number; paying_customers: number; avg_order_value: number };
  inventory_status: { total_products: number; low_stock: number; out_of_stock: number };
  payment_status: {
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
  };
  visitor_metrics: { visitors_today: number; visitors_week: number; unique_visitors_today: number };
  trending_count: number;
}

export interface AdminDashboardData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalPayments: number;
  analytics: DashboardAnalytics;
}

export async function getAdminDashboardServer(): Promise<AdminDashboardData | null> {
  try {
    const res = await serverFetch<AdminDashboardData>('/admin', {}, ['admin-dashboard']);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getAdminAnalyticsDashboardServer(): Promise<DashboardAnalytics | null> {
  try {
    const res = await serverFetch<DashboardAnalytics>('/admin/analytics/dashboard', {}, ['admin-analytics']);
    return res.data ?? null;
  } catch {
    return null;
  }
}
