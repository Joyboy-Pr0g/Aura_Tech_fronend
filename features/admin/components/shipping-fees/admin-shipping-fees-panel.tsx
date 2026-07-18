'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { ShippingFee } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format';
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
import {
  activateAdminShippingFee,
  deactivateAdminShippingFee,
  deleteAdminShippingFee,
  getAdminShippingFees,
} from '@/features/admin/services/admin-shipping-fees-client';
import {
  ShippingFeeFormModal,
  type ShippingFeeFormMode,
} from '@/features/admin/components/shipping-fees/shipping-fee-form-modal';

interface AdminShippingFeesPanelProps {
  initialFees: ShippingFee[];
}

export function AdminShippingFeesPanel({ initialFees }: AdminShippingFeesPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [fees, setFees] = useState(initialFees);
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<ShippingFeeFormMode | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteFee, setDeleteFee] = useState<ShippingFee | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setFees(initialFees);
  }, [initialFees]);

  const refreshFees = () => {
    startTransition(async () => {
      try {
        const next = await getAdminShippingFees();
        setFees(next);
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const openCreate = () => {
    setFormMode({ type: 'create' });
    setIsFormOpen(true);
  };

  const openEdit = (fee: ShippingFee) => {
    setFormMode({ type: 'edit', feeId: fee.id });
    setIsFormOpen(true);
  };

  const handleToggleActive = async (fee: ShippingFee) => {
    startTransition(async () => {
      try {
        if (fee.is_active) {
          await deactivateAdminShippingFee(fee.id);
          toast(t('admin.shippingFeeDeactivated'), 'success');
        } else {
          await activateAdminShippingFee(fee.id);
          toast(t('admin.shippingFeeActivated'), 'success');
        }
        refreshFees();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteFee) return;
    startTransition(async () => {
      try {
        await deleteAdminShippingFee(deleteFee.id);
        toast(t('admin.shippingFeeDeleted'), 'success');
        setIsDeleteOpen(false);
        setDeleteFee(null);
        refreshFees();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  return (
    <div className="space-y-6 p-8">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'sidebar.dashboard', href: '/admin' },
          { labelKey: 'admin.shippingFeesTitle', icon: Truck, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.shippingFeesTitle')}
        countLabel={t('admin.shippingFeesCount', { count: fees.length })}
        filters={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('admin.addShippingFee')}
          </Button>}
      />

      {fees.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noShippingFees')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {fees.map((fee) => (
            <div key={fee.id} className="card-dark p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-primary-400">
                    {formatCurrency(Number(fee.price))}
                  </p>
                  <p className="text-sm text-white/70 mt-1">{fee.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={fee.is_active ? 'success' : 'outline'}>
                    {fee.is_active ? t('admin.active') : t('admin.inactive')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
                        >
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-dark-900 border-white/10">
                      <DropdownMenuItem onClick={() => openEdit(fee)}>
                        <Pencil size={14} />
                        {t('admin.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(fee)}>
                        {fee.is_active ? t('admin.deactivate') : t('admin.activate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-danger"
                        onClick={() => {
                          setDeleteFee(fee);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                        {t('admin.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className={cn('rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2')}>
                <p className="text-xs uppercase tracking-wide text-white/40">
                  {t('admin.shippingFeeDeliveryWay')}
                </p>
                <p className="text-sm text-white capitalize mt-1">{fee.delivery_way}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ShippingFeeFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setFormMode(null);
        }}
        mode={formMode}
        onSuccess={refreshFees}
      />

      {deleteFee && (
        <ConfirmModal
          name={deleteFee.delivery_way}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteOpen(false);
            setDeleteFee(null);
          }}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          loading={isPending}
          confirmText={t('admin.deleteShippingFee')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
