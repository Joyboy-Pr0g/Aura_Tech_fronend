'use client';

import Link from 'next/link';
import {
  Banknote,
  ClipboardList,
  Eye,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency } from '@/lib/utils/format';
import type { AdminDashboardData } from '@/features/admin/services/admin-dashboard-server';

const QUICK_LINKS = [
  { labelKey: 'admin.pendingPayments' as const, href: '/admin/payments', icon: Banknote, color: 'text-warning' },
  { labelKey: 'admin.allOrders' as const, href: '/admin/orders', icon: ClipboardList, color: 'text-primary-500' },
  { labelKey: 'admin.analyticsTitle' as const, href: '/admin/analytics', icon: TrendingUp, color: 'text-success' },
  { labelKey: 'admin.products' as const, href: '/admin/products', icon: Package, color: 'text-secondary-500' },
  { labelKey: 'admin.users' as const, href: '/admin/users', icon: Users, color: 'text-success' },
];

interface AdminDashboardProps {
  initial: AdminDashboardData | null;
}

function MetricCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-dark p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
        </div>
        <div className="text-primary-400">{icon}</div>
      </div>
    </div>
  );
}

export function AdminDashboard({ initial }: AdminDashboardProps) {
  const { t } = useLocale();
  const analytics = initial?.analytics;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('admin.title')}</h2>
        <p className="text-white/40 mt-1">{t('admin.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {QUICK_LINKS.map((s) => (
          <Link key={s.href} href={s.href} className="card-dark p-6 hover:border-primary-500/30 transition-colors group">
            <div className={`${s.color} mb-3`}>
              <s.icon size={24} />
            </div>
            <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{t(s.labelKey)}</p>
            {s.href === '/admin/products' && initial && (
              <p className="text-xs text-white/40 mt-1">{initial.totalProducts}</p>
            )}
            {s.href === '/admin/orders' && initial && (
              <p className="text-xs text-white/40 mt-1">{initial.totalOrders}</p>
            )}
            {s.href === '/admin/users' && initial && (
              <p className="text-xs text-white/40 mt-1">{initial.totalUsers}</p>
            )}
            {s.href === '/admin/payments' && analytics && (
              <p className="text-xs text-white/40 mt-1">{analytics.payment_status.pending_count} {t('admin.pendingShort')}</p>
            )}
          </Link>
        ))}
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label={t('admin.paymentsReceivedWeek')}
              value={formatCurrency(analytics.payments_received_week)}
              sub={`${t('admin.today')}: ${formatCurrency(analytics.payments_received_today)}`}
              icon={<Wallet size={22} />}
            />
            <MetricCard
              label={t('admin.expensesWeek')}
              value={formatCurrency(analytics.expenses_week)}
              sub={`${t('admin.today')}: ${formatCurrency(analytics.expenses_today)}`}
              icon={<Banknote size={22} />}
            />
            <MetricCard
              label={t('admin.netProfitWeek')}
              value={formatCurrency(analytics.profit_week)}
              sub={`${t('admin.today')}: ${formatCurrency(analytics.profit_today)}`}
              icon={<TrendingUp size={22} />}
            />
            <MetricCard
              label={t('admin.visitorsToday')}
              value={String(analytics.visitor_metrics.unique_visitors_today)}
              sub={`${analytics.visitor_metrics.visitors_week} ${t('admin.visitorsWeek')}`}
              icon={<Eye size={22} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label={t('admin.revenueWeek')}
              value={formatCurrency(analytics.revenue_week)}
              sub={`${analytics.orders_today} ${t('admin.ordersToday')} · ${t('admin.orderSalesNote')}`}
              icon={<ClipboardList size={22} />}
            />
            <MetricCard
              label={t('admin.inventoryAlert')}
              value={`${analytics.inventory_status.low_stock}`}
              sub={`${analytics.inventory_status.out_of_stock} ${t('admin.outOfStock')}`}
              icon={<Package size={22} />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-4">{t('admin.topProducts')}</h3>
              <ul className="space-y-3">
                {analytics.top_products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/80 truncate">{p.title}</span>
                    <span className="text-white/50 shrink-0">
                      {p.sales} · {formatCurrency(p.revenue)}
                    </span>
                  </li>
                ))}
                {analytics.top_products.length === 0 && (
                  <li className="text-white/40 text-sm">{t('admin.noDataYet')}</li>
                )}
              </ul>
            </div>

            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-4">{t('admin.topCustomers')}</h3>
              <ul className="space-y-3">
                {analytics.top_customers.map((c) => (
                  <li key={c.customer_id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/80 truncate">{c.full_name || c.email}</span>
                    <span className="text-white/50 shrink-0">{formatCurrency(c.lifetime_value)}</span>
                  </li>
                ))}
                {analytics.top_customers.length === 0 && (
                  <li className="text-white/40 text-sm">{t('admin.noDataYet')}</li>
                )}
              </ul>
            </div>
          </div>

          <div className="card-dark p-6">
            <h3 className="font-semibold text-white mb-2">{t('admin.customerMetrics')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-white/40">{t('admin.totalCustomers')}</p>
                <p className="text-xl font-bold text-white">{analytics.customer_metrics.total_customers}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">{t('admin.payingCustomers')}</p>
                <p className="text-xl font-bold text-white">{analytics.customer_metrics.paying_customers}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">{t('admin.avgOrderValue')}</p>
                <p className="text-xl font-bold text-white">{formatCurrency(analytics.customer_metrics.avg_order_value)}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="card-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{t('admin.queueTitle')}</h3>
          <Link href="/admin/payments" className="text-primary-500 hover:text-primary-400 text-sm">
            {t('admin.viewAll')} →
          </Link>
        </div>
        <p className="text-white/40 text-sm">{t('admin.queueDesc')}</p>
        <Link href="/admin/payments" className="btn-primary inline-flex mt-4">
          {t('admin.openQueue')}
        </Link>
      </div>
    </div>
  );
}
