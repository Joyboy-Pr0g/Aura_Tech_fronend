'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CheckCircle2, RotateCcw, Search, XCircle } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import { RefundRequest } from '@/lib/types/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import {
  approveAdminRefundRequest,
  getAdminRefundRequests,
  rejectAdminRefundRequest,
} from '@/features/refunds/services/refunds-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';

interface AdminRefundsPanelProps {
  initial: CursorPage<RefundRequest>;
  initialStatus?: string;
  initialOrderNumber?: string;
}

export function AdminRefundsPanel({
  initial,
  initialStatus,
  initialOrderNumber,
}: AdminRefundsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [requests, setRequests] = useState(initial.items);
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [orderNumberFilter, setOrderNumberFilter] = useState(initialOrderNumber ?? '');
  const debouncedOrderNumber = useDebounce(orderNumberFilter, 500);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);
  const [rejectTarget, setRejectTarget] = useState<RefundRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const applyFilters = useCallback(
    (status: string, orderNumber: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (orderNumber.trim()) params.set('order_number', orderNumber.trim());
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
    applyFilters(statusFilter, debouncedOrderNumber);
  }, [statusFilter, debouncedOrderNumber, applyFilters]);

  useEffect(() => {
    setRequests(initial.items);
  }, [initial.items]);

  const refresh = () => {
    startTransition(async () => {
      const page = await getAdminRefundRequests({
        status: statusFilter || undefined,
        order_number: debouncedOrderNumber || undefined,
      });
      setRequests(page.items);
      router.refresh();
    });
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      try {
        await approveAdminRefundRequest(id);
        toast(t('admin.refundApproved'), 'success');
        refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleReject = async () => {
    if (!rejectTarget || rejectReason.trim().length < 3) return;
    setSubmitting(true);
    try {
      await rejectAdminRefundRequest(rejectTarget.id, rejectReason.trim());
      toast(t('admin.refundRejected'), 'success');
      setRejectTarget(null);
      setRejectReason('');
      refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.refundsTitle', icon: RotateCcw, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.refundsTitle')}
        countLabel={t('admin.refundsCount', { count: requests.length })}
        filters={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="relative sm:col-span-2">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                value={orderNumberFilter}
                onChange={(e) => setOrderNumberFilter(e.target.value)}
                placeholder={t('admin.refundsSearchOrder')}
                className="input-dark ps-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark"
            >
              <option value="">{t('admin.refundsAllStatuses')}</option>
              <option value="pending">{t('order.refundStatus.pending')}</option>
              <option value="approved">{t('order.refundStatus.approved')}</option>
              <option value="rejected">{t('order.refundStatus.rejected')}</option>
            </select>
          </div>
        }
      />

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="text-start p-4">{t('admin.orderNumber')}</th>
                <th className="text-start p-4">{t('admin.orderCustomer')}</th>
                <th className="text-start p-4">{t('order.refundReason')}</th>
                <th className="text-start p-4">{t('order.status')}</th>
                <th className="text-start p-4">{t('admin.submittedAt')}</th>
                <th className="text-end p-4">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">{t('admin.refundsEmpty')}</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b border-white/5">
                    <td className="p-4 text-white font-medium">{request.order?.order_number}</td>
                    <td className="p-4 text-white/70">{request.customer?.full_name ?? '—'}</td>
                    <td className="p-4 text-white/70 max-w-xs truncate">{request.reason}</td>
                    <td className="p-4">
                      <span className={cn(
                        'badge',
                        request.status === 'pending' && 'badge-warning',
                        request.status === 'approved' && 'badge-success',
                        request.status === 'rejected' && 'badge-danger',
                      )}>
                        {t(`order.refundStatus.${request.status}`)}
                      </span>
                    </td>
                    <td className="p-4 text-white/50">{formatDateTime(request.created_at)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {request.image_url && (
                          <a href={request.image_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                            {t('admin.viewImage')}
                          </a>
                        )}
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(request.id)}>
                              <CheckCircle2 size={14} />
                              {t('admin.approve')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectTarget(request)}>
                              <XCircle size={14} />
                              {t('admin.reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>{t('admin.rejectRefund')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="input-dark w-full resize-none"
              placeholder={t('admin.rejectReasonPlaceholder')}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleReject} disabled={submitting}>{t('admin.reject')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
