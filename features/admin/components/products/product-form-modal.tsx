'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminCategory, ProductBrand, ProductImage, ProductVariant } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage as ProductImageComponent } from '@/components/ui/product-image';
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
  createAdminProduct,
  getAdminProduct,
  setAdminProductPrimaryImage,
  updateAdminProduct,
  removeAdminProductImage,
} from '@/features/admin/services/admin-products-client';
import { cn } from '@/lib/utils/cn';
import { Plus, Star, Trash2, X } from 'lucide-react';

const productFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category_id: z.string().uuid('Category is required'),
  sub_category_id: z.string().uuid().optional().or(z.literal('')),
  brand: z.string().max(100).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface FeatureRow {
  key: string;
  value: string;
}

interface VariantRow {
  id?: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  stock_quantity: string;
}

export type ProductFormMode =
  | { type: 'create' }
  | { type: 'edit'; productId: string };

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ProductFormMode | null;
  categories: AdminCategory[];
  brands: ProductBrand[];
  onSuccess: () => void;
}

const emptyVariant = (): VariantRow => ({
  sku: '',
  size: '',
  color: '',
  price: '',
  stock_quantity: '0',
});

function featuresToRows(features: Record<string, string>): FeatureRow[] {
  const entries = Object.entries(features ?? {});
  if (!entries.length) return [{ key: '', value: '' }];
  return entries.map(([key, value]) => ({ key, value: String(value) }));
}

function rowsToFeatures(rows: FeatureRow[]): Record<string, string> {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value.trim();
    return acc;
  }, {});
}

function variantsToRows(variants?: ProductVariant[]): VariantRow[] {
  if (!variants?.length) return [];
  return variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size ?? '',
    color: variant.color ?? '',
    price: variant.price != null ? String(Number(variant.price)) : '',
    stock_quantity: String(variant.stock_quantity),
  }));
}

function rowsToVariants(rows: VariantRow[]) {
  return rows
    .filter((row) => row.sku.trim())
    .map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      sku: row.sku.trim(),
      size: row.size.trim() || null,
      color: row.color.trim() || null,
      price: row.price ? Number(row.price) : null,
      stock_quantity: Number(row.stock_quantity) || 0,
    }));
}

function resolveBrandSelection(brand: string | null | undefined, brands: ProductBrand[]) {
  const value = brand?.trim() ?? '';
  if (!value) {
    return { selectedBrand: null as string | null, customBrand: null as string | null };
  }
  if (brands.some((item) => item.brand === value)) {
    return { selectedBrand: value, customBrand: null };
  }
  return { selectedBrand: 'other', customBrand: value };
}

function buildProductBody(
  payload: Record<string, unknown>,
  imageFiles: File[],
  jsonFields: string[] = [],
): FormData | Record<string, unknown> {
  if (!imageFiles.length) return payload;

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (jsonFields.includes(key)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  imageFiles.forEach((file) => formData.append('images', file));
  return formData;
}

export function ProductFormModal({
  open,
  onOpenChange,
  mode,
  categories,
  brands,
  onSuccess,
}: ProductFormModalProps) {
  const { t } = useLocale();
  const [featureRows, setFeatureRows] = useState<FeatureRow[]>([{ key: '', value: '' }]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState<string | null>(null);
  const [stockQuantity, setStockQuantity] = useState('0');

  const isEdit = mode?.type === 'edit';
  const isOtherBrand = selectedBrand === 'other';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category_id: '',
      sub_category_id: '',
      brand: '',
    },
  });

  const selectedCategoryId = watch('category_id');
  const subCategoryOptions =
    categories.find((category) => category.id === selectedCategoryId)?.children ?? [];

  useEffect(() => {
    if (!open || !mode) return;

    setFeatureRows([{ key: '', value: '' }]);
    setVariantRows([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setExistingImages([]);
    setSelectedBrand(null);
    setCustomBrand(null);
    setStockQuantity('0');

    if (mode.type === 'create') {
      reset({
        title: '',
        description: '',
        price: 0,
        category_id: categories[0]?.id ?? '',
        sub_category_id: '',
        brand: '',
      });
      return;
    }

    setLoadingProduct(true);
    getAdminProduct(mode.productId)
      .then((product) => {
        reset({
          title: product.title,
          description: product.description,
          price: Number(product.price),
          category_id: product.category_id ?? '',
          sub_category_id: product.sub_category_id ?? '',
          brand: product.brand ?? '',
        });
        setFeatureRows(featuresToRows(product.features ?? {}));
        setVariantRows(variantsToRows(product.variants));
        setExistingImages(product.images ?? []);
        setStockQuantity(String(product.stock_quantity ?? 0));
        const brandState = resolveBrandSelection(product.brand, brands);
        setSelectedBrand(brandState.selectedBrand);
        setCustomBrand(brandState.customBrand);
      })
      .catch(() => {
        toast(t('admin.productLoadFailed'), 'error');
        onOpenChange(false);
      })
      .finally(() => setLoadingProduct(false));
  }, [open, mode, reset, onOpenChange, t, categories, brands]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetPrimary = async (publicId: string) => {
    if (mode?.type !== 'edit') return;
    setSettingPrimaryId(publicId);
    try {
      const updated = await setAdminProductPrimaryImage(mode.productId, publicId);
      setExistingImages(updated.images ?? []);
      toast(t('admin.productPrimaryImageSet'), 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleRemoveImage = async (publicId: string) => {
    if (mode?.type !== 'edit') return;
    setRemovingImage(publicId);
    try {
      const updated = await removeAdminProductImage(mode.productId, publicId);
      setExistingImages(updated.images ?? []);
      toast(t('admin.productImageRemoved'), 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setRemovingImage(null);
    }
  };

  const handleBrandSelectChange = (value: string) => {
    setSelectedBrand(value);
    if (value === 'other') {
      setCustomBrand('');
      setValue('brand', '');
      return;
    }
    setValue('brand', value);
  };


  const handleCustomBrandChange = (value: string) => {
    const found = brands.find((brand) => brand.brand.toLowerCase() === value.toLowerCase());
    if (found) {
      setSelectedBrand(found.brand);
      setCustomBrand('');
      toast(t('admin.brandAlreadyExists'), 'error');
      setValue('brand', found.brand);
      return;
    }
    setCustomBrand(value);
    setValue('brand', value.toUpperCase());
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!mode) return;

    const features = rowsToFeatures(featureRows);
    const basePayload: Record<string, unknown> = {
      title: values.title.trim(),
      description: values.description.trim(),
      price: values.price,
      category_id: values.category_id,
      sub_category_id: values.sub_category_id || null,
      brand: values.brand?.trim() || '',
      features,
    };

    setSubmitting(true);
    try {
      const variants = rowsToVariants(variantRows);

      basePayload.stock_quantity = Math.max(0, Number(stockQuantity) || 0);

      if (mode.type === 'create') {
        const payload = { ...basePayload, variants };
        const body = buildProductBody(payload, newImageFiles, ['features', 'variants']);
        await createAdminProduct(body);
        toast(t('admin.productCreated'), 'success');
      } else {
        const payload = { ...basePayload, variants };
        const body = buildProductBody(payload, newImageFiles, ['features', 'variants']);
        await updateAdminProduct(mode.productId, body);
        toast(t('admin.productUpdated'), 'success');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? t('admin.editProduct') : t('admin.addProduct');
  const description = isEdit ? t('admin.editProductDesc') : t('admin.addProductDesc');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {loadingProduct ? (
              <p className="text-white/50 text-sm">{t('admin.loading')}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-title">{t('admin.productTitle')}</Label>
                    <Input id="product-title" {...register('title')} error={Boolean(errors.title)} />
                    {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-description">{t('admin.productDescription')}</Label>
                    <textarea
                      id="product-description"
                      {...register('description')}
                      rows={4}
                      className="input-dark w-full resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-danger">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-price">{t('admin.productPrice')}</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price')}
                      error={Boolean(errors.price)}
                    />
                    {errors.price && <p className="text-xs text-danger">{errors.price.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-brand">{t('admin.productBrand')}</Label>
                    <select id="product-brand"
                      value={selectedBrand ?? ''}
                      onChange={(e) => handleBrandSelectChange(e.target.value)}
                      className="input-dark w-full">
                      <option value="">{t('admin.selectBrand')}</option>
                      {brands.map((brand) => (
                        <option key={brand.brand} value={brand.brand}>
                          {brand.brand}
                        </option>
                      ))}
                      <option value="other">{t('admin.other')}</option>
                    </select>
                    {isOtherBrand && (
                      <Input
                        id="product-brand-other"
                        value={customBrand ?? ''}
                        onChange={(e) => handleCustomBrandChange(e.target.value)}
                        placeholder={t('admin.enterBrandName')}
                        className="input-dark w-full"
                      />
                    )}
                    {errors.brand && <p className="text-xs text-danger">{errors.brand.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-category">{t('admin.productCategory')}</Label>
                    <select
                      id="product-category"
                      {...register('category_id', {
                        onChange: () => setValue('sub_category_id', ''),
                      })}
                      className="input-dark w-full"
                    >
                      <option value="">{t('admin.selectCategory')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-xs text-danger">{errors.category_id.message}</p>
                    )}
                  </div>

                  {subCategoryOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="product-sub-category">{t('admin.productSubCategory')}</Label>
                      <select
                        id="product-sub-category"
                        {...register('sub_category_id')}
                        className="input-dark w-full"
                      >
                        <option value="">{t('admin.selectSubCategory')}</option>
                        {subCategoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="product-stock">{t('admin.productStockQuantity')}</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                    />
                    <p className="text-xs text-white/40">{t('admin.productStockHint')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('admin.productFeatures')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFeatureRows((rows) => [...rows, { key: '', value: '' }])}
                    >
                      <Plus size={14} className="me-1" />
                      {t('admin.addFeature')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {featureRows.map((row, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={t('admin.featureKey')}
                          value={row.key}
                          onChange={(e) => {
                            const next = [...featureRows];
                            next[index] = { ...next[index], key: e.target.value };
                            setFeatureRows(next);
                          }}
                        />
                        <Input
                          placeholder={t('admin.featureValue')}
                          value={row.value}
                          onChange={(e) => {
                            const next = [...featureRows];
                            next[index] = { ...next[index], value: e.target.value };
                            setFeatureRows(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFeatureRows((rows) => rows.filter((_, i) => i !== index))}
                          disabled={featureRows.length === 1}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('admin.productVariants')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVariantRows((rows) => [...rows, emptyVariant()])}
                    >
                      <Plus size={14} className="me-1" />
                      {t('admin.addVariant')}
                    </Button>
                  </div>
                  {variantRows.length === 0 ? (
                    <p className="text-sm text-white/40">{t('admin.noVariantsOptional')}</p>
                  ) : (
                    <div className="space-y-3">
                      {variantRows.map((row, index) => (
                        <div key={row.id ?? `variant-${index}`} className="card-dark p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/70">
                              {t('admin.variant')} {index + 1}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setVariantRows((rows) => rows.filter((_, i) => i !== index))}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <Input
                              placeholder="SKU"
                              value={row.sku}
                              onChange={(e) => {
                                const next = [...variantRows];
                                next[index] = { ...next[index], sku: e.target.value };
                                setVariantRows(next);
                              }}
                            />
                            <Input
                              placeholder={t('admin.variantColor')}
                              value={row.color}
                              onChange={(e) => {
                                const next = [...variantRows];
                                next[index] = { ...next[index], color: e.target.value };
                                setVariantRows(next);
                              }}
                            />
                            <Input
                              placeholder={t('admin.variantSize')}
                              value={row.size}
                              onChange={(e) => {
                                const next = [...variantRows];
                                next[index] = { ...next[index], size: e.target.value };
                                setVariantRows(next);
                              }}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={t('admin.variantPrice')}
                              value={row.price}
                              onChange={(e) => {
                                const next = [...variantRows];
                                next[index] = { ...next[index], price: e.target.value };
                                setVariantRows(next);
                              }}
                            />
                            <Input
                              type="number"
                              min="0"
                              placeholder={t('admin.variantStock')}
                              value={row.stock_quantity}
                              onChange={(e) => {
                                const next = [...variantRows];
                                next[index] = { ...next[index], stock_quantity: e.target.value };
                                setVariantRows(next);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="product-images">{t('admin.productImages')}</Label>

                  {isEdit && existingImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {existingImages.map((image) => {
                        return (
                          <div
                            key={image.public_id}
                            className={cn(
                              'relative rounded-xl border overflow-hidden',
                              removingImage === image.public_id ? 'border-danger/50 opacity-50' : 'border-white/10',
                            )}
                          >
                            <div className="relative h-24">
                              <ProductImageComponent src={image.url} alt={watch('title') || 'product'} fill />
                            </div>
                            <div className="flex items-center justify-between gap-1 p-2 bg-dark-950/80">
                              {image.is_primary && (
                                <span className="text-[10px] text-primary-400 font-medium">{t('admin.primary')}</span>
                              )}
                              {!image.is_primary && !removingImage && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={settingPrimaryId === image.public_id}
                                  onClick={() => handleSetPrimary(image.public_id)}
                                >
                                  <Star size={14} />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveImage(image.public_id)}
                                disabled={removingImage === image.public_id || settingPrimaryId === image.public_id}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(newImagePreviews.length > 0 || !isEdit) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {newImagePreviews.map((preview, index) => (
                        <div key={preview} className="relative rounded-xl border border-white/10 overflow-hidden">
                          <div className="relative h-24">
                            <ProductImageComponent src={preview} alt="" fill />
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 rounded-full bg-dark-950/80 p-1 text-white/70 hover:text-white"
                            onClick={() => removeNewImage(index)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                  />
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || loadingProduct}>
              {submitting ? t('admin.saving') : isEdit ? t('admin.saveChanges') : t('admin.create')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
