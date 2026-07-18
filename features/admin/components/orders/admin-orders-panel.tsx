'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ClipboardList, ExternalLink, Search } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminLastActionLabel } from '@/features/admin/components/audit/admin-last-action-label';
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from '@/features/admin/services/admin-orders-client';

const PAGE_SIZE = 20;

const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  pending_payment: ['cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

interface AdminOrdersPanelProps {
  initial: CursorPage<Order>;
  initialSearch?: string;
  initialStatus?: string;
}

export function AdminOrdersPanel({
  initial,
  initialSearch,
  initialStatus,
}: AdminOrdersPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [orders, setOrders] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);
  const latestActions = useAdminLatestActions('order', orders.map((o) => o.id));

  useEffect(() => {
    setOrders(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const buildQueryParams = useCallback((search: string, status: string) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    return params;
  }, []);

  const applyFilters = useCallback(
    (search: string, status: string) => {
      const query = buildQueryParams(search, status).toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [buildQueryParams, pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      try {
        const page = await getAdminOrders({
          search: debouncedSearch.trim() || undefined,
          status: statusFilter || undefined,
          limit: PAGE_SIZE,
        });
        setOrders(page.items);
        setNextCursor(page.next_cursor);
        setHasMore(page.has_more);
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  }, [debouncedSearch, statusFilter, router, t]);

  const loadMore = () => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      const page = await getAdminOrders({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        cursor: nextCursor,
      });
      setOrders((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      toast(t('admin.orderMoved', { status: t(`orderStatus.${newStatus}`) }), 'success');
      refreshList();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.statusFailed'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusBadge = (status: OrderStatus) => (
    <span className={cn('text-xs font-medium', ORDER_STATUS_COLORS[status])}>
      {t(`orderStatus.${status}`)}
    </span>
  );

  const renderStatusSelect = (order: Order) => {
    const nextOptions = NEXT_STATUSES[order.status] ?? [];
    if (nextOptions.length === 0) return null;
    return (
      <select
        key={order.status}
        disabled={updatingId === order.id}
        defaultValue=""
        onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value as OrderStatus)}
        className="input-dark w-full sm:w-auto text-sm py-1.5"
      >
        <option value="" disabled>{t('admin.moveTo')}</option>
        {nextOptions.map((status) => (
          <option key={status} value={status}>{t(`orderStatus.${status}`)}</option>
        ))}
      </select>
    );
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="card-dark p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/orders/${order.id}`} className="font-semibold text-white hover:text-primary-400">
            {order.order_number}
          </Link>
          <p className="text-sm text-white/50 truncate mt-1">
            {order.customer?.full_name ?? '—'} · {order.customer?.email ?? order.customer_id.slice(0, 8)}
          </p>
        </div>
        <Link
          href={`/admin/orders/${order.id}`}
          className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-white hover:bg-white/5"
        >
          <ExternalLink size={16} />
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {renderStatusBadge(order.status)}
        <Badge variant="outline">{formatCurrency(order.total)}</Badge>
      </div>
      <p className="text-sm text-white/40">{formatDateTime(order.created_at)}</p>
      <AdminLastActionLabel action={latestActions[order.id]} />
      {renderStatusSelect(order)}
    </div>
  );

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.allOrders', icon: ClipboardList, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.allOrders')}
        countLabel={t('admin.ordersCount', { count: orders.length })}
        filters={
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.searchOrders')}
                className="input-dark ps-9 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark w-full lg:w-auto lg:min-w-[200px]"
            >
              <option value="">{t('admin.allStatuses')}</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{t(`orderStatus.${status}`)}</option>
              ))}
            </select>
          </div>
        }
      />

      {orders.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noOrders')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-5 py-4 font-medium">{t('admin.orderNumber')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderCustomer')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderEmail')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderStatusLabel')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderTotal')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.orderDate')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                    <th className="admin-table-actions-head">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-white hover:text-primary-400">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-white/80">{order.customer?.full_name ?? '—'}</td>
                      <td className="px-5 py-4 text-white/50">{order.customer?.email ?? '—'}</td>
                      <td className="px-5 py-4">{renderStatusBadge(order.status)}</td>
                      <td className="px-5 py-4 font-semibold text-white">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-4 text-white/50">{formatDateTime(order.created_at)}</td>
                      <td className="px-5 py-4">
                        <AdminLastActionLabel action={latestActions[order.id]} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {renderStatusSelect(order)}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-white hover:bg-white/5"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {orders.map(renderOrderCard)}
          </div>
        </>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button type="button" onClick={loadMore} disabled={isPending} className="btn-outline">
            {t('admin.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
