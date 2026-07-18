'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, TrendingUp, Users, Wallet } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardAnalytics } from '@/features/admin/services/admin-dashboard-server';
import {
  getAdminCustomersAnalytics,
  getAdminExpensesHistoryAnalytics,
  getAdminFinancialAnalytics,
  getAdminInventoryLogsClient,
  getAdminInventoryTurnoverClient,
  getAdminPaymentHistoryAnalytics,
  getAdminPaymentStatusAnalytics,
  getAdminRevenueAnalytics,
  getAdminTopProductsAnalytics,
} from '@/features/admin/services/admin-analytics-client';
import type {
  ExpenseHistoryRow,
  FinancialPeriodSummary,
  InventoryLogRow,
  InventoryTurnoverRow,
  PaymentHistoryRow,
  RevenueByDayRow,
  TopCustomerRow,
  TopProductRow,
} from '@/features/admin/services/admin-analytics-types';

type TabId = 'overview' | 'revenue' | 'inventory' | 'payments';

interface AdminAnalyticsPanelProps {
  initial: DashboardAnalytics | null;
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AdminAnalyticsPanel({ initial }: AdminAnalyticsPanelProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>('overview');
  const [fromDate, setFromDate] = useState(defaultDateRange().from);
  const [toDate, setToDate] = useState(defaultDateRange().to);
  const [loading, setLoading] = useState(false);
  const [revenueRows, setRevenueRows] = useState<RevenueByDayRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductRow[]>(initial?.top_products ?? []);
  const [topCustomers, setTopCustomers] = useState<TopCustomerRow[]>(initial?.top_customers ?? []);
  const [inventoryTurnover, setInventoryTurnover] = useState<InventoryTurnoverRow[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogRow[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRow[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseHistoryRow[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialPeriodSummary | null>(null);
  const [paymentStatus, setPaymentStatus] = useState(initial?.payment_status ?? null);

  const tabs = useMemo(
    () =>
      [
        { id: 'overview' as const, label: t('admin.analyticsOverview'), icon: BarChart3 },
        { id: 'revenue' as const, label: t('admin.analyticsRevenue'), icon: TrendingUp },
        { id: 'inventory' as const, label: t('admin.analyticsInventory'), icon: Package },
        { id: 'payments' as const, label: t('admin.analyticsPayments'), icon: Wallet },
      ],
    [t],
  );

  const loadTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'revenue') {
        const [revenue, products] = await Promise.all([
          getAdminRevenueAnalytics({ from_date: fromDate, to_date: toDate }),
          getAdminTopProductsAnalytics(20),
        ]);
        setRevenueRows(revenue);
        setTopProducts(products);
      } else if (tab === 'inventory') {
        const [turnover, logs] = await Promise.all([
          getAdminInventoryTurnoverClient(20),
          getAdminInventoryLogsClient({ limit: 50 }),
        ]);
        setInventoryTurnover(turnover);
        setInventoryLogs(logs);
      } else if (tab === 'payments') {
        const [status, history, financial, expenses] = await Promise.all([
          getAdminPaymentStatusAnalytics(),
          getAdminPaymentHistoryAnalytics({ from_date: fromDate, to_date: toDate, limit: 50 }),
          getAdminFinancialAnalytics({ from_date: fromDate, to_date: toDate }),
          getAdminExpensesHistoryAnalytics({ from_date: fromDate, to_date: toDate, limit: 50 }),
        ]);
        setPaymentStatus(status);
        setPaymentHistory(history);
        setFinancialSummary(financial);
        setExpenseHistory(expenses);
      } else if (tab === 'overview') {
        const customers = await getAdminCustomersAnalytics({ limit: 10 });
        if (customers) {
          setTopCustomers(customers.top_customers);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [tab, fromDate, toDate]);

  useEffect(() => {
    if (tab === 'overview' && initial) return;
    void loadTabData();
  }, [tab, loadTabData, initial]);

  const analytics = initial;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('admin.analyticsTitle')}</h2>
        <p className="text-white/40 mt-1">{t('admin.analyticsSubtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {(tab === 'revenue' || tab === 'payments') && (
        <div className="card-dark p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('admin.analyticsFromDate')}</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-dark" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">{t('admin.analyticsToDate')}</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-dark" />
          </div>
          <Button type="button" variant="outline" onClick={() => void loadTabData()} disabled={loading}>
            {loading ? t('admin.refreshing') : t('admin.analyticsApply')}
          </Button>
        </div>
      )}

      {loading && tab !== 'overview' && (
        <p className="text-sm text-white/40">{t('common.loading')}</p>
      )}

      {tab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card-dark p-5">
              <p className="text-sm text-white/50">{t('admin.paymentsReceivedWeek')}</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.payments_received_week)}</p>
            </div>
            <div className="card-dark p-5">
              <p className="text-sm text-white/50">{t('admin.expensesWeek')}</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.expenses_week)}</p>
            </div>
            <div className="card-dark p-5">
              <p className="text-sm text-white/50">{t('admin.netProfitWeek')}</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.profit_week)}</p>
            </div>
            <div className="card-dark p-5">
              <p className="text-sm text-white/50">{t('admin.visitorsToday')}</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.visitor_metrics.unique_visitors_today}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-4">{t('admin.topProducts')}</h3>
              <ul className="space-y-2">
                {analytics.top_products.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-white/80 truncate">{p.title}</span>
                    <span className="text-white/50 shrink-0">{formatCurrency(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('admin.topCustomers')}
              </h3>
              <ul className="space-y-2">
                {topCustomers.map((c) => (
                  <li key={c.customer_id} className="flex justify-between gap-3 text-sm">
                    <span className="text-white/80 truncate">{c.full_name || c.email}</span>
                    <span className="text-white/50 shrink-0">{formatCurrency(c.lifetime_value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'revenue' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.analyticsRevenueByDay')}</h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {revenueRows.map((row) => (
                <li key={row.day} className="flex justify-between gap-3 text-sm border-b border-white/5 pb-2">
                  <span className="text-white/70">{row.day}</span>
                  <span className="text-white/50">
                    {formatCurrency(row.revenue)} · {row.order_count} {t('admin.analyticsOrderCount')}
                  </span>
                </li>
              ))}
              {revenueRows.length === 0 && !loading && (
                <li className="text-white/40 text-sm">{t('admin.noDataYet')}</li>
              )}
            </ul>
          </div>
          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.topProducts')}</h3>
            <ul className="space-y-2">
              {topProducts.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-white/80 truncate">{p.title}</span>
                  <span className="text-white/50 shrink-0">{p.sales} · {formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.analyticsInventoryTurnover')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 text-start font-medium">{t('admin.productTitle')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.analyticsSold')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.productStock')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.analyticsTurnoverRate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryTurnover.map((row) => (
                    <tr key={row.product_id} className="border-b border-white/5">
                      <td className="py-2 text-white/80">{row.title}</td>
                      <td className="py-2 text-white/60">{row.sold_quantity}</td>
                      <td className="py-2 text-white/60">{row.current_stock}</td>
                      <td className="py-2 text-white/60">{row.turnover_rate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.analyticsInventoryLogs')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 text-start font-medium">{t('admin.productTitle')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.analyticsChange')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.analyticsReason')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.orderDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5">
                      <td className="py-2 text-white/80">{log.product?.title ?? log.product_id.slice(0, 8)}</td>
                      <td className={`py-2 ${log.quantity_change >= 0 ? 'text-success' : 'text-danger'}`}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </td>
                      <td className="py-2 text-white/60">{t(`admin.inventoryReason.${log.reason}` as never)}</td>
                      <td className="py-2 text-white/50">{formatDateTime(log.created_at)}</td>
                    </tr>
                  ))}
                  {inventoryLogs.length === 0 && !loading && (
                    <tr><td colSpan={4} className="py-4 text-white/40">{t('admin.noDataYet')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-6">
          {(financialSummary || paymentStatus) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="card-dark p-5">
                <p className="text-sm text-white/50">{t('admin.analyticsPaymentsReceived')}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(financialSummary?.payments_received ?? paymentStatus?.payments_received_total ?? 0)}
                </p>
                {paymentStatus && (
                  <p className="text-xs text-white/40 mt-1">
                    {t('admin.today')}: {formatCurrency(paymentStatus.payments_received_today)}
                  </p>
                )}
              </div>
              <div className="card-dark p-5">
                <p className="text-sm text-white/50">{t('admin.analyticsExpensesTotal')}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(financialSummary?.expenses_total ?? paymentStatus?.expenses_total ?? 0)}
                </p>
                {paymentStatus && (
                  <p className="text-xs text-white/40 mt-1">
                    {t('admin.companyExpenses')}: {formatCurrency(paymentStatus.expenses_company_total)} ·{' '}
                    {t('admin.refundExpenses')}: {formatCurrency(paymentStatus.expenses_refund_total)}
                  </p>
                )}
              </div>
              <div className="card-dark p-5">
                <p className="text-sm text-white/50">{t('admin.netProfit')}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(financialSummary?.net_profit ?? paymentStatus?.net_profit_total ?? 0)}
                </p>
              </div>
              <div className="card-dark p-5">
                <p className="text-sm text-white/50">{t('admin.pendingPayments')}</p>
                <p className="text-2xl font-bold text-white mt-1">{paymentStatus?.pending_count ?? 0}</p>
                <p className="text-xs text-white/40 mt-1">
                  {t('admin.analyticsApprovedToday')}: {paymentStatus?.approved_today ?? 0}
                </p>
              </div>
            </div>
          )}

          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.analyticsPaymentHistory')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 text-start font-medium">{t('admin.orderNumber')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.paymentAmount')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.paymentStatusLabel')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.submitted')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-2 text-white/80 font-mono text-xs">{row.order_number}</td>
                      <td className="py-2 text-white/70">{formatCurrency(row.amount)}</td>
                      <td className="py-2 text-white/60">{t(`admin.paymentStatus.${row.status}`)}</td>
                      <td className="py-2 text-white/50">{formatDateTime(row.submitted_at)}</td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && !loading && (
                    <tr><td colSpan={4} className="py-4 text-white/40">{t('admin.noDataYet')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-4">{t('admin.analyticsExpensesHistory')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="py-2 text-start font-medium">{t('admin.expenseType')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.orderNumber')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.expenseAmount')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.expenseReason')}</th>
                    <th className="py-2 text-start font-medium">{t('admin.submittedAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseHistory.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="py-2 text-white/70">
                        {row.type === 'refund' ? t('admin.refundExpenses') : t('admin.companyExpenses')}
                      </td>
                      <td className="py-2 text-white/80 font-mono text-xs">{row.order_number ?? '—'}</td>
                      <td className="py-2 text-danger">{formatCurrency(row.amount)}</td>
                      <td className="py-2 text-white/60 max-w-xs truncate">{row.reason}</td>
                      <td className="py-2 text-white/50">{formatDateTime(row.created_at)}</td>
                    </tr>
                  ))}
                  {expenseHistory.length === 0 && !loading && (
                    <tr><td colSpan={5} className="py-4 text-white/40">{t('admin.noDataYet')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
