import { clientFetch } from '@/lib/api/client';
import { bffPath } from '@/lib/api/bff';
import { endpoints } from '@/lib/api/endpoints';
import type {
  CustomerAnalyticsResponse,
  DashboardAnalytics,
  InventoryLogRow,
  InventoryStatus,
  InventoryTurnoverRow,
  PaymentHistoryRow,
  PaymentStatusSummary,
  FinancialPeriodSummary,
  ExpenseHistoryRow,
  RevenueByDayRow,
  TopProductRow,
} from '@/features/admin/services/admin-analytics-types';
import type { PaymentStatus } from '@/lib/types/entities';
import type { AnalyticsPeriod } from '@/lib/utils/analytics-period';

export type AnalyticsPeriodParams = {
  period?: AnalyticsPeriod;
  from_date?: string;
  to_date?: string;
};

const analyticsBase = '/api/admin/analytics';

export async function getAdminAnalyticsDashboardClient(): Promise<DashboardAnalytics | null> {
  const res = await clientFetch<DashboardAnalytics>(bffPath(endpoints.admin.analytics.dashboard));
  return res.data ?? null;
}

export async function getAdminRevenueAnalytics(params: AnalyticsPeriodParams): Promise<RevenueByDayRow[]> {
  const res = await clientFetch<RevenueByDayRow[]>(`${analyticsBase}/revenue`, { searchParams: params });
  return res.data ?? [];
}

export async function getAdminTopProductsAnalytics(
  limit = 20,
  params?: AnalyticsPeriodParams,
): Promise<TopProductRow[]> {
  const res = await clientFetch<TopProductRow[]>(`${analyticsBase}/products/top`, {
    searchParams: { limit, ...params },
  });
  return res.data ?? [];
}

export async function getAdminCustomersAnalytics(params?: {
  sort?: 'lifetime_value' | 'order_count';
  limit?: number;
}): Promise<CustomerAnalyticsResponse | null> {
  const res = await clientFetch<CustomerAnalyticsResponse>(`${analyticsBase}/customers`, {
    searchParams: params,
  });
  return res.data ?? null;
}

export async function getAdminInventoryStatusClient(): Promise<InventoryStatus | null> {
  const res = await clientFetch<InventoryStatus>(`${analyticsBase}/inventory/status`);
  return res.data ?? null;
}

export async function getAdminInventoryTurnoverClient(limit = 20): Promise<InventoryTurnoverRow[]> {
  const res = await clientFetch<InventoryTurnoverRow[]>(`${analyticsBase}/inventory/turnover`, {
    searchParams: { limit },
  });
  return res.data ?? [];
}

export async function getAdminInventoryLogsClient(params?: {
  product_id?: string;
  reason?: string;
  limit?: number;
}): Promise<InventoryLogRow[]> {
  const res = await clientFetch<InventoryLogRow[]>(`${analyticsBase}/inventory/logs`, {
    searchParams: params,
  });
  return res.data ?? [];
}

export async function getAdminPaymentStatusAnalytics(): Promise<PaymentStatusSummary | null> {
  const res = await clientFetch<PaymentStatusSummary>(`${analyticsBase}/payments/status`);
  return res.data ?? null;
}

export async function getAdminPaymentHistoryAnalytics(params?: AnalyticsPeriodParams & {
  status?: PaymentStatus;
  limit?: number;
}): Promise<PaymentHistoryRow[]> {
  const res = await clientFetch<PaymentHistoryRow[]>(`${analyticsBase}/payments/history`, {
    searchParams: params,
  });
  return res.data ?? [];
}

export async function getAdminFinancialAnalytics(params?: AnalyticsPeriodParams): Promise<FinancialPeriodSummary | null> {
  const res = await clientFetch<FinancialPeriodSummary>(`${analyticsBase}/financial`, {
    searchParams: params,
  });
  return res.data ?? null;
}

export async function getAdminExpensesHistoryAnalytics(params?: AnalyticsPeriodParams & {
  limit?: number;
}): Promise<ExpenseHistoryRow[]> {
  const res = await clientFetch<ExpenseHistoryRow[]>(`${analyticsBase}/expenses/history`, {
    searchParams: params,
  });
  return res.data ?? [];
}
