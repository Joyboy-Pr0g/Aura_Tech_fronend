'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCategory } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage } from '@/components/ui/product-image';
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
import {
  createAdminCategory,
  getAdminCategory,
  updateAdminCategory,
} from '@/features/admin/services/admin-categories-client';

function createCategoryFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('validation.nameMin2')).max(100),
    description: z.string().min(10, t('validation.descriptionMin10')).max(500),
    parent_category_id: z
      .union([z.string().uuid(), z.literal('')])
      .nullable()
      .optional()
      .transform((value) => (!value || value === '' ? null : value)),
    is_active: z.boolean(),
  });
}

type CategoryFormValues = z.infer<ReturnType<typeof createCategoryFormSchema>>;

export type CategoryFormMode =
  | { type: 'create'; parentCategoryId?: string | null; parentCategoryName?: string }
  | { type: 'edit'; categoryId: string };

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CategoryFormMode | null;
  parentCategories: AdminCategory[];
  onSuccess: () => void;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  mode,
  parentCategories,
  onSuccess,
}: CategoryFormModalProps) {
  const { t } = useLocale();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode?.type === 'edit';
  const isSubcategoryCreate = mode?.type === 'create' && Boolean(mode.parentCategoryId);
  const lockParent = isSubcategoryCreate;
  const categoryFormSchema = useMemo(() => createCategoryFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parent_category_id: null,
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const parentCategoryId = watch('parent_category_id');

  useEffect(() => {
    if (!open || !mode) return;

    setImageFile(null);
    setImagePreview(null);

    if (mode.type === 'create') {
      reset({
        name: '',
        description: '',
        parent_category_id: mode.parentCategoryId ?? null,
        is_active: true,
      });
      return;
    }

    setLoadingCategory(true);
    getAdminCategory(mode.categoryId)
      .then((category) => {
        reset({
          name: category.name,
          description: category.description ?? '',
          parent_category_id: category.parent_category_id,
          is_active: category.is_active,
        });
        setImagePreview(category.image_url);
      })
      .catch(() => {
        toast(t('admin.categoryLoadFailed'), 'error');
        onOpenChange(false);
      })
      .finally(() => setLoadingCategory(false));
  }, [open, mode, reset, onOpenChange, t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (!mode) return;
    if (!imageFile && !isEdit) {
      toast(t('admin.categoryImageRequired'), 'error');
      return;
    }
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      is_active: values.is_active,
      ...(values.parent_category_id && { parent_category_id: values.parent_category_id }),
    };

    const body = imageFile ? (() => {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      formData.append('image', imageFile);

      return formData;
    })() : payload;

    setSubmitting(true);
    try {
      if (mode.type === 'create') {
        await createAdminCategory(body);
        toast(t('admin.categoryCreated'), 'success');
      } else {
        await updateAdminCategory(mode.categoryId, body);
        toast(t('admin.categoryUpdated'), 'success');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, 'error');
      } else {
        toast(t('admin.actionFailed'), 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit
    ? parentCategoryId
      ? t('admin.editSubcategory')
      : t('admin.editCategory')
    : isSubcategoryCreate
      ? t('admin.addSubcategory')
      : t('admin.addCategory');

  const description = isSubcategoryCreate && mode?.type === 'create'
    ? t('admin.addSubcategoryDesc', { name: mode.parentCategoryName ?? '' })
    : isEdit
      ? t('admin.editCategoryDesc')
      : t('admin.addCategoryDesc');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-5">
            {loadingCategory ? (
              <p className="text-white/50 text-sm">{t('admin.loading')}</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="category-name">{t('admin.categoryName')}</Label>
                  <Input
                    id="category-name"
                    {...register('name')}
                    placeholder={t('admin.categoryNamePlaceholder')}
                    error={Boolean(errors.name)}
                  />
                  {errors.name && (
                    <p className="text-xs text-danger">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-description">{t('admin.categoryDescription')}</Label>
                  <textarea
                    id="category-description"
                    {...register('description')}
                    rows={3}
                    placeholder={t('admin.categoryDescriptionPlaceholder')}
                    className="input-dark w-full resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-danger">{errors.description.message}</p>
                  )}
                </div>

                {!lockParent && (
                  <div className="space-y-2">
                    <Label htmlFor="category-parent">{t('admin.parentCategory')}</Label>
                    <select
                      id="category-parent"
                      value={parentCategoryId ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue('parent_category_id', value === '' ? null : value);
                      }}
                      className="input-dark w-full"
                    >
                      <option value="">{t('admin.noParentCategory')}</option>
                      {parentCategories
                        .filter((c) => !c.deleted_at && (mode?.type !== 'edit' || c.id !== mode.categoryId))
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {lockParent && mode?.type === 'create' && (
                  <div className="space-y-2">
                    <Label>{t('admin.parentCategory')}</Label>
                    <Input value={mode.parentCategoryName ?? ''} disabled />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    id="category-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setValue('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-dark-900 accent-primary-500"
                  />
                  <Label htmlFor="category-active" className="cursor-pointer">
                    {t('admin.categoryActive')}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-image">{t('admin.categoryImage')}</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 shrink-0">
                      <ProductImage
                        src={imagePreview}
                        alt={watch('name') || 'category'}
                        fill
                        className="rounded-xl"
                      />
                    </div>
                    <Input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || loadingCategory}>
              {submitting ? t('admin.saving') : isEdit ? t('admin.saveChanges') : t('admin.create')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
