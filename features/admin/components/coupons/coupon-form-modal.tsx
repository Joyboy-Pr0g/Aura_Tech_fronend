'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coupon, Category, Product } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { createAdminCoupon, updateAdminCoupon } from '@/features/admin/services/admin-coupons-client';
import { RefreshCcwIcon } from 'lucide-react';
import { generateCouponCode } from '@/lib/products/helpers';

const couponFormSchema = z.object({
  code: z.string().trim().min(2).max(50),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.coerce.number().positive(),
  max_uses: z.coerce.number().int().min(1).optional().nullable(),
  min_purchase_amount: z.coerce.number().min(0).optional(),
  max_discount_amount: z.coerce.number().min(0).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  category_id: z.string().uuid().optional().nullable().or(z.literal('')),
  sub_category_id: z.string().uuid().optional().nullable().or(z.literal('')),
  product_id: z.string().uuid().optional().nullable().or(z.literal('')),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

export type CouponFormMode =
  | { type: 'create' }
  | { type: 'edit'; coupon: Coupon };

interface CouponFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CouponFormMode | null;
  onSuccess: () => void;
  categories?: Category[];
  products?: Product[];
}

export function CouponFormModal({
  open,
  onOpenChange,
  mode,
  onSuccess,
  categories = [],
  products = [],
}: CouponFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode?.type === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      max_uses: null,
      min_purchase_amount: 0,
      max_discount_amount: null,
      expires_at: null,
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const discountType = watch('discount_type');
  const selectedCategoryId = watch('category_id');
  const selectedSubCategoryId = watch('sub_category_id');
  const selectedProductId = watch('product_id');

  const parentCategories = categories.filter((c) => !c.parent_category_id);
  const subCategories = categories.filter((c) => c.parent_category_id);

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.type === 'edit') {
      reset({
        code: mode.coupon.code,
        discount_type: mode.coupon.discount_type,
        discount_value: Number(mode.coupon.discount_value),
        max_uses: mode.coupon.max_uses,
        min_purchase_amount: Number(mode.coupon.min_purchase_amount),
        max_discount_amount: mode.coupon.max_discount_amount != null ? Number(mode.coupon.max_discount_amount) : null,
        expires_at: mode.coupon.expires_at ? mode.coupon.expires_at.slice(0, 16) : null,
        is_active: mode.coupon.is_active,
        category_id: mode.coupon.category_id ?? '',
        sub_category_id: mode.coupon.sub_category_id ?? '',
        product_id: mode.coupon.product_id ?? '',
      });
    } else {
      reset({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        max_uses: null,
        min_purchase_amount: 0,
        max_discount_amount: null,
        expires_at: null,
        is_active: true,
        category_id: '',
        sub_category_id: '',
        product_id: '',
      });
    }
  }, [open, mode, reset]);

  const onSubmit = async (values: CouponFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
        category_id: values.category_id || null,
        sub_category_id: values.sub_category_id || null,
        product_id: values.product_id || null,
      };
      if (isEdit && mode?.type === 'edit') {
        await updateAdminCoupon(mode.coupon.id, payload);
        toast(t('admin.couponUpdated'), 'success');
      } else {
        await createAdminCoupon(payload);
        toast(t('admin.couponCreated'), 'success');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEdit ? t('admin.editCoupon') : t('admin.addCoupon')}</ModalTitle>
          <ModalDescription>{t('admin.couponFormDesc')}</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t('admin.couponCode')}</Label>
              <div className="flex items-center gap-4">
                <Input id="code" {...register('code')} className="input-dark uppercase" disabled={isEdit} />
                <Button type="button" title={t('admin.generateCouponCode')} aria-label={t('admin.generateCouponCode')} size="icon" onClick={() => setValue('code', generateCouponCode({prefix: 'AuraTech', length: 10, separator: '-'}))}><RefreshCcwIcon className="w-4 h-4" /></Button>
                {errors.code && <p className="text-xs text-danger mt-2">{errors.code.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">{t('admin.couponType')}</Label>
                <select id="discount_type" {...register('discount_type')} className="input-dark w-full">
                  <option value="percentage">{t('admin.couponPercentage')}</option>
                  <option value="fixed_amount">{t('admin.couponFixed')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {discountType === 'percentage' ? t('admin.couponPercentValue') : t('admin.couponFixedValue')}
                </Label>
                <Input id="discount_value" type="number" step="0.01" {...register('discount_value')} className="input-dark" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_purchase_amount">{t('admin.couponMinPurchase')}</Label>
                <Input id="min_purchase_amount" type="number" step="0.01" {...register('min_purchase_amount')} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">{t('admin.couponMaxDiscount')}</Label>
                <Input id="max_discount_amount" type="number" step="0.01" {...register('max_discount_amount')} className="input-dark" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_uses">{t('admin.couponMaxUses')}</Label>
                <Input id="max_uses" type="number" {...register('max_uses')} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">{t('admin.couponExpires')}</Label>
                <Input id="expires_at" type="datetime-local" {...register('expires_at')} className="input-dark" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={Boolean(isActive)}
                onChange={(e) => setValue('is_active', e.target.checked)}
              />
              {t('admin.couponActive')}
            </label>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-sm font-medium text-white/80">{t('admin.couponScope')}</p>
              <p className="text-xs text-white/40">{t('admin.couponScopeHint')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">{t('admin.couponScopeCategory')}</Label>
                  <select
                    id="category_id"
                    {...register('category_id', {
                      onChange: () => {
                        setValue('sub_category_id', '');
                        setValue('product_id', '');
                      },
                    })}
                    className="input-dark w-full"
                    disabled={Boolean(selectedSubCategoryId || selectedProductId)}
                  >
                    <option value="">{t('admin.couponScopeAny')}</option>
                    {parentCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub_category_id">{t('admin.couponScopeSubCategory')}</Label>
                  <select
                    id="sub_category_id"
                    {...register('sub_category_id', {
                      onChange: () => {
                        setValue('category_id', '');
                        setValue('product_id', '');
                      },
                    })}
                    className="input-dark w-full"
                    disabled={Boolean(selectedCategoryId || selectedProductId)}
                  >
                    <option value="">{t('admin.couponScopeAny')}</option>
                    {subCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_id">{t('admin.couponScopeProduct')}</Label>
                  <select
                    id="product_id"
                    {...register('product_id', {
                      onChange: () => {
                        setValue('category_id', '');
                        setValue('sub_category_id', '');
                      },
                    })}
                    className="input-dark w-full"
                    disabled={Boolean(selectedCategoryId || selectedSubCategoryId)}
                  >
                    <option value="">{t('admin.couponScopeAny')}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {isEdit ? t('common.save') : t('admin.addCoupon')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
