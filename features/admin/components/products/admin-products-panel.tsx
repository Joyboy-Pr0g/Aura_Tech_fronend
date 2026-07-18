'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Archive, MoreHorizontal, Package, Search } from 'lucide-react';
import { AdminCategory, AdminProduct, ProductBrand } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { TogglePill } from '@/components/ui/toggle-pill';
import { ProductImage } from '@/components/ui/product-image';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { formatCurrency } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/en';
import {
  deleteAdminProduct,
  getAdminProducts,
  restoreAdminProduct,
  softDeleteAdminProduct,
} from '@/features/admin/services/admin-products-client';
import { ProductFormModal, type ProductFormMode } from '@/features/admin/components/products/product-form-modal';
import { AddStockModal } from '@/features/admin/components/products/add-stock-modal';
import { AdminAuditTrigger } from '@/features/admin/components/audit/admin-audit-trigger';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { getProductImageUrl, getAvailableStock } from '@/lib/products/helpers';

const PAGE_SIZE = 20;

interface AdminProductsPanelProps {
  initial: CursorPage<AdminProduct>;
  categories: AdminCategory[];
  initialSearch?: string;
  initialCategoryId?: string;
  initialBrand?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialInStock?: string;
  initialIncludeDeleted?: boolean;
  brands: ProductBrand[];
}

export function AdminProductsPanel({
  initial,
  categories,
  initialSearch,
  initialCategoryId,
  initialBrand,
  initialMinPrice,
  initialMaxPrice,
  initialInStock,
  initialIncludeDeleted,
  brands,
}: AdminProductsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryId ?? '');
  const [brandFilter, setBrandFilter] = useState(initialBrand ?? '');
  const [minPriceFilter, setMinPriceFilter] = useState(initialMinPrice ?? '');
  const [maxPriceFilter, setMaxPriceFilter] = useState(initialMaxPrice ?? '');
  const [inStockFilter, setInStockFilter] = useState(initialInStock ?? '');
  const debouncedSearch = useDebounce<string>(searchInput);
  const debouncedBrand = useDebounce<string>(brandFilter);
  const debouncedMinPrice = useDebounce<string>(minPriceFilter);
  const debouncedMaxPrice = useDebounce<string>(maxPriceFilter, 500);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted ?? false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<ProductFormMode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [addStockProduct, setAddStockProduct] = useState<AdminProduct | null>(null);
  const isInitialRender = useRef(true);
  const latestActions = useAdminLatestActions('product', products.map((p) => p.id));

  const brandOptions = useMemo(() => {
    return brands.sort((a, b) => a.brand.localeCompare(b.brand));
  }, [brands]);

  useEffect(() => {
    setProducts(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const buildFilterParams = useCallback(
    (search: string, categoryId: string, brand: string, minPrice: string, maxPrice: string, inStock: string, deleted: boolean) => ({
      search: search.trim() || undefined,
      category_id: categoryId || undefined,
      brand: brand.trim() || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      in_stock: inStock === '' ? undefined : inStock === 'true',
      include_deleted: deleted,
      limit: PAGE_SIZE,
    }),
    [],
  );

  const applyFilters = useCallback(
    (search: string, categoryId: string, brand: string, minPrice: string, maxPrice: string, inStock: string, deleted: boolean) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryId) params.set('category_id', categoryId);
      if (brand.trim()) params.set('brand', brand.trim());
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (inStock) params.set('in_stock', inStock);
      params.set('include_deleted', deleted.toString());
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
    applyFilters(debouncedSearch, categoryFilter, debouncedBrand, debouncedMinPrice, debouncedMaxPrice, inStockFilter, includeDeleted);
  }, [debouncedSearch, categoryFilter, debouncedBrand, debouncedMinPrice, debouncedMaxPrice, inStockFilter, includeDeleted, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminProducts(
        buildFilterParams(debouncedSearch, categoryFilter, debouncedBrand, debouncedMinPrice, debouncedMaxPrice, inStockFilter, includeDeleted),
      );
      setProducts(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  }, [buildFilterParams, debouncedSearch, categoryFilter, debouncedBrand, debouncedMinPrice, debouncedMaxPrice, inStockFilter, includeDeleted]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await getAdminProducts({
        ...buildFilterParams(debouncedSearch, categoryFilter, debouncedBrand, debouncedMinPrice, debouncedMaxPrice, inStockFilter, includeDeleted),
        cursor: nextCursor,
      });
      setProducts((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const runAction = async (id: string, action: () => Promise<void>, successKey: TranslationKey) => {
    setActionId(id);
    try {
      await action();
      toast(t(successKey), 'success');
      refreshList();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setActionId(null);
      setIsConfirmModalOpen(false);
    }
  };

  const renderStatusBadges = (product: AdminProduct) => (
    <div className="flex flex-wrap items-center gap-2">
      {product.deleted_at ? (
        <Badge variant="danger">{t('admin.productDeletedBadge')}</Badge>
      ) : getAvailableStock(product) > 0 ? (
        <Badge variant="success">{t('admin.inStock')}</Badge>
      ) : (
        <Badge variant="warning">{t('admin.outOfStock')}</Badge>
      )}
    </div>
  );

  const renderProductActions = (product: AdminProduct) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={actionId === product.id}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuItem onClick={() => handleEditClick(product.id)}>
          {t('admin.editProduct')}
        </DropdownMenuItem>
        {!product.deleted_at && (
          <DropdownMenuItem onClick={() => handleAddStockClick(product)}>
            {t('admin.addStock')}
          </DropdownMenuItem>
        )}
        {!product.deleted_at && (
          <DropdownMenuItem
            className="text-danger focus:text-danger"
            onClick={() => handleDeleteClick(product)}
          >
            {t('admin.softDeleteProduct')}
          </DropdownMenuItem>
        )}
        {product.deleted_at && (
          <>
            <DropdownMenuItem
              onClick={() => runAction(product.id, () => restoreAdminProduct(product.id), 'admin.productRestored')}
            >
              {t('admin.restoreProduct')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleDeleteClick(product)}
            >
              {t('admin.deleteProduct')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleDeleteClick = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsConfirmModalOpen(true);
  };

  const handleEditClick = (productId: string) => {
    setFormMode({ type: 'edit', productId });
    setIsFormModalOpen(true);
  };

  const handleAddProductClick = () => {
    setFormMode({ type: 'create' });
    setIsFormModalOpen(true);
  };

  const handleAddStockClick = (product: AdminProduct) => {
    setAddStockProduct(product);
    setIsAddStockModalOpen(true);
  };

  const handleAddStockModalOpenChange = (open: boolean) => {
    setIsAddStockModalOpen(open);
    if (!open) setAddStockProduct(null);
  };

  const handleFormModalOpenChange = (open: boolean) => {
    setIsFormModalOpen(open);
    if (!open) setFormMode(null);
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.products', icon: Package, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.products')}
        countLabel={t('admin.productsCount', { count: products.length })}
        filters={
          <>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-3 sm:space-y-0">
              <div className="relative w-full max-w-2xl">
                <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('admin.searchProducts')}
                  className="input-dark ps-9 w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-dark w-full"
                >
                  <option value="">{t('admin.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.parent_category_id ? `— ${category.name}` : category.name}
                    </option>
                  ))}
                </select>
                <TogglePill
                  checked={includeDeleted}
                  onCheckedChange={setIncludeDeleted}
                  label={t('admin.includeDeleted')}
                  icon={<Archive size={15} />}
                />
                <Button className="w-full" variant="primary" size="md" onClick={handleAddProductClick}>
                  {t('admin.addProduct')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">{t('admin.allBrands')}</option>
                {brandOptions.map((brand) => (
                  <option key={brand.brand} value={brand.brand}>
                    {brand.brand}
                  </option>
                ))}
              </select>

              <select
                value={inStockFilter}
                onChange={(e) => setInStockFilter(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">{t('admin.allStockStatuses')}</option>
                <option value="true">{t('admin.inStock')}</option>
                <option value="false">{t('admin.outOfStock')}</option>
              </select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(e.target.value)}
                placeholder={t('admin.minPrice')}
                className="input-dark w-full"
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                placeholder={t('admin.maxPrice')}
                className="input-dark w-full"
              />

            </div>
          </>
        }
      />

      {products.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noProducts')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-5 py-4 font-medium">{t('admin.productImage')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productTitle')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productBrand')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productCategory')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productSubCategory')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productPrice')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productStock')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.productStatus')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                    <th className="admin-table-actions-head">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10">
                          <ProductImage src={getProductImageUrl(product)} alt={product.title} fill className="rounded-lg" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{product.title}</p>
                        <p className="text-xs text-white/40">{product.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-white/70">{product.brand || '—'}</td>
                      <td className="px-5 py-4 text-white/70">{product.category?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-white/70">{product.sub_category?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-white">{formatCurrency(product.price)}</td>
                      <td className="px-5 py-4 text-white/70">{getAvailableStock(product)}</td>
                      <td className="px-5 py-4">{renderStatusBadges(product)}</td>
                      <td className="px-5 py-4">
                        <AdminAuditTrigger
                          createdBy={product.created_by}
                          updatedBy={product.updated_by}
                          action={latestActions[product.id]}
                        />
                      </td>
                      <td className="admin-table-actions-cell">{renderProductActions(product)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="card-dark p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <ProductImage src={getProductImageUrl(product)} alt={product.title} fill className="rounded-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{product.title}</p>
                      <p className="text-sm text-white/50 truncate">{product.brand || product.slug}</p>
                      <AdminAuditTrigger
                        createdBy={product.created_by}
                        updatedBy={product.updated_by}
                        action={latestActions[product.id]}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {renderProductActions(product)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {renderStatusBadges(product)}
                  <Badge variant="outline">{formatCurrency(product.price)}</Badge>
                  <Badge variant="outline">{getAvailableStock(product)} {t('admin.inStockShort')}</Badge>
                </div>
              </div>
            ))}
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

      <ProductFormModal
        open={isFormModalOpen}
        onOpenChange={handleFormModalOpenChange}
        mode={formMode}
        categories={categories}
        brands={brandOptions}
        onSuccess={refreshList}
      />

      <AddStockModal
        open={isAddStockModalOpen}
        onOpenChange={handleAddStockModalOpenChange}
        product={addStockProduct}
        onSuccess={refreshList}
      />

      {selectedProduct && (
        <ConfirmModal
          name={selectedProduct.title}
          onConfirm={
            selectedProduct.deleted_at
              ? () => runAction(selectedProduct.id, () => deleteAdminProduct(selectedProduct.id), 'admin.productDeleted')
              : () => runAction(selectedProduct.id, () => softDeleteAdminProduct(selectedProduct.id), 'admin.productSoftDeleted')
          }
          onCancel={() => setIsConfirmModalOpen(false)}
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          loading={isPending}
          confirmText={selectedProduct.deleted_at ? t('admin.deleteProduct') : t('admin.softDeleteProduct')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
