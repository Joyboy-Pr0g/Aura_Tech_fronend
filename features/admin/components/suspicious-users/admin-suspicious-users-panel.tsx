'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Ban, ExternalLink, ShieldAlert, Trash2, UserX } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import {
  SuspiciousReportStatus,
  SuspiciousUserReport,
} from '@/lib/types/entities';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import {
  blockSuspiciousUserReport,
  deleteSuspiciousUserReport,
  dismissSuspiciousUserReport,
  getAdminSuspiciousUsers,
} from '@/features/admin/services/admin-suspicious-users-client';

const PAGE_SIZE = 20;
const STATUSES: Array<SuspiciousReportStatus | 'all'> = ['open', 'dismissed', 'blocked', 'deleted', 'all'];

interface AdminSuspiciousUsersPanelProps {
  initial: CursorPage<SuspiciousUserReport>;
  initialStatus?: string;
}

function statusVariant(status: SuspiciousReportStatus) {
  if (status === 'open') return 'warning' as const;
  if (status === 'dismissed') return 'secondary' as const;
  return 'danger' as const;
}

function categoryLabelKey(category: SuspiciousUserReport['category']) {
  const map = {
    profile_churn: 'admin.suspiciousCategoryProfile',
    address_churn: 'admin.suspiciousCategoryAddress',
    order_churn: 'admin.suspiciousCategoryOrder',
    mixed: 'admin.suspiciousCategoryMixed',
  } as const;
  return map[category];
}

export function AdminSuspiciousUsersPanel({ initial, initialStatus }: AdminSuspiciousUsersPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [reports, setReports] = useState(initial.items);
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? 'open');
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [selected, setSelected] = useState<SuspiciousUserReport | null>(null);
  const [pendingAction, setPendingAction] = useState<'dismiss' | 'block' | 'delete-user' | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  useEffect(() => {
    setReports(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const applyStatus = useCallback(
    (status: string) => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyStatus(statusFilter);
  }, [statusFilter, applyStatus]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminSuspiciousUsers({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: PAGE_SIZE,
      });
      setReports(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  }, [statusFilter]);

  const loadMore = () => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      const page = await getAdminSuspiciousUsers({
        status: statusFilter === 'all' ? undefined : statusFilter,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setReports((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const runAction = async () => {
    if (!selected || !pendingAction) return;
    setActionId(selected.id);
    try {
      if (pendingAction === 'dismiss') {
        await dismissSuspiciousUserReport(selected.id);
        toast(t('admin.suspiciousDismissed'), 'success');
      } else if (pendingAction === 'block') {
        await blockSuspiciousUserReport(selected.id);
        toast(t('admin.suspiciousBlocked'), 'success');
      } else {
        await deleteSuspiciousUserReport(selected.id);
        toast(t('admin.suspiciousDeleted'), 'success');
      }
      setSelected(null);
      setPendingAction(null);
      refreshList();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.suspiciousUsersTitle', icon: ShieldAlert, iconClassName: 'text-amber-400' },
        ]}
        title={t('admin.suspiciousUsersTitle')}
        countLabel={t('admin.suspiciousCount', { count: reports.length })}
        filters={
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  statusFilter === status
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-300'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/80',
                )}
              >
                {status === 'all' ? t('admin.suspiciousStatusAll') : t(`admin.suspiciousStatus.${status}` as 'admin.suspiciousStatus.open')}
              </button>
            ))}
          </div>
        }
      />

      {reports.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-10 text-center text-white/50">
          {t('admin.suspiciousEmpty')}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-white/10 bg-dark-900/50 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(report.status)}>
                      {t(`admin.suspiciousStatus.${report.status}`)}
                    </Badge>
                    <Badge variant="outline">{t(categoryLabelKey(report.category))}</Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{report.user?.full_name ?? report.user_id}</p>
                    <p className="text-sm text-white/50">{report.user?.email}</p>
                  </div>
                  <p className="text-sm text-amber-200/90">{report.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-white/40">
                    {report.signals.profile_updates_24h != null && report.signals.profile_updates_24h > 0 && (
                      <span>{t('admin.suspiciousSignalProfile', { count: report.signals.profile_updates_24h })}</span>
                    )}
                    {report.signals.password_changes_24h != null && report.signals.password_changes_24h > 0 && (
                      <span>{t('admin.suspiciousSignalPassword', { count: report.signals.password_changes_24h })}</span>
                    )}
                    {report.signals.address_changes_24h != null && report.signals.address_changes_24h > 0 && (
                      <span>{t('admin.suspiciousSignalAddress', { count: report.signals.address_changes_24h })}</span>
                    )}
                    {report.signals.orders_placed_24h != null && report.signals.orders_placed_24h > 0 && (
                      <span>{t('admin.suspiciousSignalOrders', { count: report.signals.orders_placed_24h })}</span>
                    )}
                    {report.signals.orders_cancelled_7d != null && report.signals.orders_cancelled_7d > 0 && (
                      <span>{t('admin.suspiciousSignalCancelled', { count: report.signals.orders_cancelled_7d })}</span>
                    )}
                    {report.signals.refund_requests_7d != null && report.signals.refund_requests_7d > 0 && (
                      <span>{t('admin.suspiciousSignalRefunds', { count: report.signals.refund_requests_7d })}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/35">
                    {t('admin.suspiciousLastDetected')}: {formatDateTime(report.last_detected_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <ButtonLink href={`/admin/users/${report.user_id}`} variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    {t('admin.viewUserProfile')}
                  </ButtonLink>
                  {report.status === 'open' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionId === report.id}
                        onClick={() => {
                          setSelected(report);
                          setPendingAction('dismiss');
                        }}
                      >
                        <UserX className="h-4 w-4" />
                        {t('admin.suspiciousDismiss')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionId === report.id}
                        onClick={() => {
                          setSelected(report);
                          setPendingAction('block');
                        }}
                      >
                        <Ban className="h-4 w-4" />
                        {t('admin.suspiciousBlock')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={actionId === report.id}
                        onClick={() => {
                          setSelected(report);
                          setPendingAction('delete-user');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('admin.suspiciousDeleteUser')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? t('common.loading') : t('admin.loadMore')}
          </Button>
        </div>
      )}

      {selected && pendingAction && (
        <ConfirmModal
          isOpen={Boolean(selected && pendingAction)}
          setIsOpen={(open) => {
            if (!open) {
              setSelected(null);
              setPendingAction(null);
            }
          }}
          onCancel={() => {
            setSelected(null);
            setPendingAction(null);
          }}
          onConfirm={runAction}
          name={selected.user?.full_name ?? selected.user_id}
          confirmText={
            pendingAction === 'dismiss'
              ? t('admin.suspiciousDismiss')
              : pendingAction === 'block'
                ? t('admin.suspiciousBlock')
                : t('admin.suspiciousDeleteUser')
          }
          cancelText={t('admin.cancel')}
          loading={Boolean(actionId)}
          confirmVariant={pendingAction === 'delete-user' ? 'danger' : 'primary'}
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
