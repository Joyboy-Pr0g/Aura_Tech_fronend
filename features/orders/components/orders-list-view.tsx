'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Order, OrderStatus } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from '@/lib/utils/format';
import { getProductImageUrl } from '@/lib/products/helpers';
import { ProductImage } from '@/components/ui/product-image';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getMyOrders } from '@/features/orders/services/orders-client';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

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

interface OrdersListViewProps {
  initial: CursorPage<Order>;
  initialSearch?: string;
  initialStatus?: string;
}

export function OrdersListView({
  initial,
  initialSearch,
  initialStatus,
}: OrdersListViewProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [orders, setOrders] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const hasActiveFilters = Boolean(initialSearch?.trim() || initialStatus);

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

  const loadMore = () => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      const page = await getMyOrders({
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

  return (
    <div className={cn('p-6 sm:p-8 space-y-5 transition-opacity', isPending && 'opacity-60')}>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('orders.title')}</h2>
          <p className="text-white/40 mt-1 text-sm">{t('orders.count', { count: orders.length })}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('orders.searchPlaceholder')}
              className="input-dark ps-9 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-dark w-full sm:w-auto sm:min-w-[200px]"
          >
            <option value="">{t('orders.allStatuses')}</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`orderStatus.${status}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card-dark p-10 text-center">
          <Package size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">
            {hasActiveFilters ? t('orders.noResults') : t('orders.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order) => {
            const itemCount = order.items?.length ?? 0;
            const previewItems = order.items?.slice(0, 3) ?? [];
            const extraCount = itemCount - previewItems.length;

            return (
              <article
                key={order.id}
                className="card-dark px-3.5 py-3 space-y-2.5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-start gap-x-5 gap-y-1 min-w-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/35">{t('orders.date')}</p>
                      <p className="text-sm text-white font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/35">{t('orders.summary')}</p>
                      <p className="text-sm text-white/70">
                        {t('orders.deliveryProducts', { deliveries: 1, products: itemCount })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-end">
                      <p className="text-[10px] uppercase tracking-wide text-white/35">{t('order.total')}</p>
                      <p className="text-sm font-bold text-primary-400">{formatCurrency(order.total)}</p>
                    </div>
                    <Link
                      href={`/dashboard/orders/${order.order_number}`}
                      className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
                    >
                      {t('orders.detail')}
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className={cn('text-xs font-medium', ORDER_STATUS_COLORS[order.status])}>
                    {t(`orderStatus.${order.status}`)}
                  </span>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {previewItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-[220px]"
                      >
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10 bg-dark-800 shrink-0">
                          <ProductImage
                            src={item.product ? getProductImageUrl(item.product) : null}
                            alt={item.product?.title ?? t('reviews.product')}
                            fill
                            sizes="48px"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium line-clamp-2 leading-snug">
                            {item.product?.title ?? t('reviews.product')}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-white/40 mt-0.5">
                              {t('cart.qty')}: {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <span className="text-xs text-white/45 shrink-0">
                        +{extraCount} {t('orders.moreProducts')}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button type="button" onClick={loadMore} disabled={isPending} className="btn-outline">
            {isPending ? t('common.loading') : t('orders.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
