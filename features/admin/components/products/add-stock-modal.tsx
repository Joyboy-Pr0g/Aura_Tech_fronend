'use client';

import { useEffect, useState } from 'react';
import { AdminProduct, ProductVariant } from '@/lib/types/entities';
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
import { addAdminProductStock } from '@/features/admin/services/admin-products-client';

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  onSuccess: () => void;
}

import { getVariantLabel } from '@/lib/products/helpers';

export function AddStockModal({ open, onOpenChange, product, onSuccess }: AddStockModalProps) {
  const { t } = useLocale();
  const [quantity, setQuantity] = useState('1');
  const [variantId, setVariantId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;

  useEffect(() => {
    if (!open) return;
    setQuantity('1');
    setNotes('');
    setVariantId(variants[0]?.id ?? '');
  }, [open, product?.id, variants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast(t('admin.addStockQuantityInvalid'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addAdminProductStock(product.id, {
        quantity: parsedQuantity,
        variant_id: variantId !== '' ? variantId : undefined,
        notes: notes.trim() || undefined,
      });
      toast(t('admin.stockAdded'), 'success');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>{t('admin.addStock')}</ModalTitle>
          <ModalDescription>
            {product ? t('admin.addStockDesc', { title: product.title }) : t('admin.addStockDescGeneric')}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            {hasVariants && (
              <div className="space-y-2">
                <Label htmlFor="add-stock-variant">{t('admin.addStockVariant')}</Label>
                <select
                  id="add-stock-variant"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="input-dark w-full"
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {getVariantLabel(variant)} — {variant.stock_quantity}
                    </option>
                  ))}
                  <option value="">{t('admin.mainProductStock')}</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="add-stock-quantity">{t('admin.addStockQuantity')}</Label>
              <Input
                id="add-stock-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-stock-notes">{t('admin.addStockNotes')}</Label>
              <textarea
                id="add-stock-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-dark w-full resize-none"
                placeholder={t('admin.addStockNotesPlaceholder')}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || !product}>
              {submitting ? t('admin.saving') : t('admin.addStock')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
