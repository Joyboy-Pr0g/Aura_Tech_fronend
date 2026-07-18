'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Coupon, Category, Product } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { deleteAdminCoupon, getAdminCoupons } from '@/features/admin/services/admin-coupons-client';
import { CouponFormModal, type CouponFormMode } from '@/features/admin/components/coupons/coupon-form-modal';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminLastActionLabel } from '@/features/admin/components/audit/admin-last-action-label';

interface AdminCouponsPanelProps {
  initialCoupons: Coupon[];
  categories?: Category[];
  products?: Product[];
}

export function AdminCouponsPanel({
  initialCoupons,
  categories = [],
  products = [],
}: AdminCouponsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<CouponFormMode | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const latestActions = useAdminLatestActions('coupon', coupons.map((c) => c.id));

  useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  const refresh = () => {
    startTransition(async () => {
      try {
        setCoupons(await getAdminCoupons());
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteCoupon) return;
    startTransition(async () => {
      try {
        await deleteAdminCoupon(deleteCoupon.id);
        toast(t('admin.couponDeleted'), 'success');
        setIsDeleteOpen(false);
        setDeleteCoupon(null);
        refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.couponsTitle', icon: Tag, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.couponsTitle')}
        countLabel={t('admin.couponsCount', { count: coupons.length })}
        filters={
          <Button onClick={() => { setFormMode({ type: 'create' }); setIsFormOpen(true); }}>
            <Plus size={16} />
            {t('admin.addCoupon')}
          </Button>
        }
      />

      {coupons.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noCoupons')}</p>
        </div>
      ) : (
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="admin-table-head">
                  <th className="px-5 py-4 font-medium">{t('admin.couponCode')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.couponDiscount')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.couponUsage')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.couponMinPurchase')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.couponExpires')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.couponStatus')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                  <th className="admin-table-actions-head">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono font-medium text-primary-400">{coupon.code}</td>
                    <td className="px-5 py-4 text-white/80">
                      {coupon.discount_type === 'percentage'
                        ? `${Number(coupon.discount_value)}%`
                        : formatCurrency(Number(coupon.discount_value))}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {coupon.current_uses}
                      {coupon.max_uses != null ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-4 text-white/70">{formatCurrency(Number(coupon.min_purchase_amount))}</td>
                    <td className="px-5 py-4 text-white/50">
                      {coupon.expires_at ? formatDateTime(coupon.expires_at) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={coupon.is_active ? 'success' : 'secondary'}>
                        {coupon.is_active ? t('admin.active') : t('admin.inactive')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <AdminLastActionLabel action={latestActions[coupon.id]} />
                    </td>
                    <td className="admin-table-actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5">
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-dark-900 border-white/10">
                          <DropdownMenuItem onClick={() => { setFormMode({ type: 'edit', coupon }); setIsFormOpen(true); }}>
                            <Pencil size={14} className="me-2" />
                            {t('admin.editCoupon')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger focus:text-danger"
                            onClick={() => { setDeleteCoupon(coupon); setIsDeleteOpen(true); }}
                          >
                            <Trash2 size={14} className="me-2" />
                            {t('admin.deleteCoupon')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CouponFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        onSuccess={refresh}
        categories={categories}
        products={products}
      />

      {deleteCoupon && (
        <ConfirmModal
          name={deleteCoupon.code}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteOpen(false);
            setDeleteCoupon(null);
          }}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          loading={isPending}
          confirmText={t('admin.deleteCoupon')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
