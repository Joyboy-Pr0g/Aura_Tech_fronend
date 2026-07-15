'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MoreHorizontal, Search, Archive, ListIcon } from 'lucide-react';
import { AdminCategory } from '@/lib/types/entities';
import { ApiResponse, CursorPage } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { TogglePill } from '@/components/ui/toggle-pill';
import { ProductImage } from '@/components/ui/product-image';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/models/modal';
import { ConfirmModal } from '@/components/ui/models/confirm';
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
  activateAdminCategory,
  deactivateAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  restoreAdminCategory,
  softDeleteAdminCategory,
  unassignParentAdminCategory,
} from '@/features/admin/services/admin-categories-client';
import { CategoryFormModal, type CategoryFormMode } from '@/features/admin/components/categories/category-form-modal';
import { AdminPageHeader } from '@/components/ui/admin-page-header';

const PAGE_SIZE = 20;

interface AdminCategoriesPanelProps {
  initial: CursorPage<AdminCategory>;
  initialSearch?: string;
  initialStatus?: string;
  initialIncludeDeleted?: boolean;
}

export function AdminCategoriesPanel({
  initial,
  initialSearch,
  initialStatus,
  initialIncludeDeleted,
}: AdminCategoriesPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const debouncedSearch = useDebounce<string>(searchInput);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted ?? false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<CategoryFormMode | null>(null);
  const [selectedObject, setSelectedObject] = useState<AdminCategory | null>(null);
  const isInitialRender = useRef(true);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);

  useEffect(() => {
    setCategories(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const applyFilters = useCallback(
    (search: string, status: string, deleted: boolean) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('is_active', status);
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
    applyFilters(debouncedSearch, statusFilter, includeDeleted);
  }, [debouncedSearch, statusFilter, includeDeleted, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminCategories({
        search: debouncedSearch.trim() || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter === 'true',
        limit: PAGE_SIZE,
        include_deleted: includeDeleted,
      });
      setCategories(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
      setSelectedCategory((current) => {
        if (!current) return current;
        return page.items.find((category) => category.id === current.id) ?? current;
      });
    });
  }, [debouncedSearch, statusFilter, includeDeleted]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await getAdminCategories({
        search: debouncedSearch.trim() || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter === 'true',
        limit: PAGE_SIZE,
        cursor: nextCursor,
        include_deleted: includeDeleted,
      });
      setCategories((prev) => [...prev, ...page.items]);
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
      if (error instanceof Error) {
        toast(error.message, 'error');
      } else {
        toast(t('admin.actionFailed'), 'error');
      }
    } finally {
      setActionId(null);
      setIsConfirmModalOpen(false);
    }
  };

  const renderStatusBadges = (category: AdminCategory) => (
    <div className="flex flex-wrap items-center gap-2">
      {category.deleted_at ? (
        <Badge variant="danger">{t('admin.categoryDeletedBadge')}</Badge>
      ) : category.is_active ? (
        <Badge variant="success">{t('admin.categoryActive')}</Badge>
      ) : (
        <Badge variant="warning">{t('admin.categoryInactive')}</Badge>
      )}
    </div>
  );

  const renderSubcategories = (category: AdminCategory) => {
    if (!category.children.length) return '—';
    return (
      <Badge className='cursor-pointer' onClick={() => handleSubcategoriesClick(category)} variant="outline">{t('admin.subcategoriesCount', { count: category.children.length })}</Badge>
    );
  };

  const renderCategoryActions = (category: AdminCategory) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={actionId === category.id}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuItem onClick={() => handleEditClick(category.id)}>
          {t('admin.editCategory')}
        </DropdownMenuItem>
        {!category.deleted_at && (
          <>
            {category.is_active ? (
              <DropdownMenuItem
                onClick={() => runAction(category.id, () => deactivateAdminCategory(category.id), 'admin.categoryDeactivated')}
              >
                {t('admin.deactivateCategory')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => runAction(category.id, () => activateAdminCategory(category.id), 'admin.categoryActivated')}
              >
                {t('admin.activateCategory')}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleDeleteClick(category)}
            >
              {t('admin.softDeleteCategory')}
            </DropdownMenuItem>
          </>
        )}
        {category.deleted_at && (
          <>
            <DropdownMenuItem
              onClick={() => runAction(category.id, () => restoreAdminCategory(category.id), 'admin.categoryRestored')}
            >
              {t('admin.restoreCategory')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleDeleteClick(category)}
            >
              {t('admin.deleteCategory')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderSubcategoryActions = (child: AdminCategory) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={actionId === child.id}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuItem onClick={() => handleEditClick(child.id)}>
          {t('admin.editSubcategory')}
        </DropdownMenuItem>
        {!child.deleted_at && (
          <>
            {child.is_active ? (
              <DropdownMenuItem
                onClick={() => runAction(child.id, () => deactivateAdminCategory(child.id), 'admin.categoryDeactivated')}
              >
                {t('admin.deactivateCategory')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => runAction(child.id, () => activateAdminCategory(child.id), 'admin.categoryActivated')}
              >
                {t('admin.activateCategory')}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleDeleteClick(child)}
            >
              {t('admin.softDeleteCategory')}
            </DropdownMenuItem>
          </>
        )}
        {child.deleted_at && (
          <>
            <DropdownMenuItem
              onClick={() => runAction(child.id, () => restoreAdminCategory(child.id), 'admin.categoryRestored')}
            >
              {t('admin.restoreCategory')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => runAction(child.id, () => deleteAdminCategory(child.id), 'admin.categoryDeleted')}
            >
              {t('admin.deleteCategory')}
            </DropdownMenuItem>
          </>
        )}
        {child.parent_category_id && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => runAction(child.id, () => unassignParentAdminCategory(child.id), 'admin.parentUnassigned')}
            >
              {t('admin.unassignParent')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleSubcategoriesClick = (category: AdminCategory) => {
    if (category.children.length === 0) return;
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: AdminCategory) => {
    setSelectedObject(category);
    setIsConfirmModalOpen(true);
  };

  const handleEditClick = (categoryId: string) => {
    setFormMode({ type: 'edit', categoryId });
    setIsFormModalOpen(true);
  };

  const handleAddCategoryClick = () => {
    setFormMode({ type: 'create' });
    setIsFormModalOpen(true);
  };

  const handleAddSubcategoryClick = () => {
    if (!selectedCategory) return;
    setFormMode({
      type: 'create',
      parentCategoryId: selectedCategory.id,
      parentCategoryName: selectedCategory.name,
    });
    setIsFormModalOpen(true);
  };

  const handleFormModalOpenChange = (open: boolean) => {
    setIsFormModalOpen(open);
    if (!open) setFormMode(null);
  };

  const parentCategories = categories.filter((category) => !category.parent_category_id && !category.deleted_at);


  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.categories', icon: ListIcon, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.categories')}
        countLabel={t('admin.categoriesCount', { count: categories.length })}
        filters={
          <>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full max-w-2xl">
                <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('admin.searchCategories')}
                  className="input-dark ps-9 w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-dark w-full sm:w-auto sm:min-w-[160px] flex-1"
                >
                  <option value="">{t('admin.allCategoryStatuses')}</option>
                  <option value="true">{t('admin.categoryActive')}</option>
                  <option value="false">{t('admin.categoryInactive')}</option>
                </select>
                <TogglePill
                  checked={includeDeleted}
                  onCheckedChange={setIncludeDeleted}
                  label={t('admin.includeDeleted')}
                  icon={<Archive size={15} />}
                />
                <Button variant="primary" size="md" onClick={handleAddCategoryClick}>
                  {t('admin.addCategory')}
                </Button>
              </div>
            </div>
          </>
        }
      />

      {categories.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noCategories')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/50">
                    <th className="px-5 py-4 font-medium">{t('admin.categoryImage')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.categoryName')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.categorySlug')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.categoryProducts')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.categorySubcategories')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.categoryStatus')}</th>
                    <th className="px-5 py-4 font-medium text-right">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10">
                          <ProductImage src={category.image_url} alt={category.name} fill className="rounded-lg" />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-white">{category.name}</td>
                      <td className="px-5 py-4 text-white/50">{category.slug}</td>
                      <td className="px-5 py-4 text-white/70">{category.product_count}</td>
                      <td className="px-5 py-4">{renderSubcategories(category)}</td>
                      <td className="px-5 py-4">{renderStatusBadges(category)}</td>
                      <td className="px-5 py-4 text-right">{renderCategoryActions(category)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="card-dark p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <ProductImage src={category.image_url} alt={category.name} fill className="rounded-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{category.name}</p>
                      <p className="text-sm text-white/50 truncate">{category.slug}</p>
                    </div>
                  </div>
                  {renderCategoryActions(category)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {renderStatusBadges(category)}
                  <Badge variant="outline">{category.product_count} {t('admin.categoryProductsShort')}</Badge>
                  {renderSubcategories(category)}
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

      {/* Subcategories Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent size="xl">
          <ModalHeader>
            <ModalTitle>{selectedCategory?.name}</ModalTitle>
            <ModalDescription>
              {selectedCategory
                ? t('admin.subcategoriesOf', { name: selectedCategory.name })
                : t('admin.categorySubcategories')}
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCategory?.children.map((child) => (
                <div key={child.id} className="relative card-dark p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <ProductImage src={child.image_url} alt={child.name} fill className="rounded-lg" />
                    </div>
                    <p className="font-semibold text-white truncate">{child.name}</p>
                  </div>
                  <span className="absolute top-0 right-2">
                    {renderSubcategoryActions(child)}
                  </span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={handleAddSubcategoryClick}>
              {t('admin.addSubcategory')}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('admin.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CategoryFormModal
        open={isFormModalOpen}
        onOpenChange={handleFormModalOpenChange}
        mode={formMode}
        parentCategories={parentCategories}
        onSuccess={refreshList}
      />

      {/* Delete Modal */}
      {selectedObject && (
        <ConfirmModal
          name={`${selectedObject.name} ${!selectedObject.parent_category_id ? 'Category' : 'Subcategory'}`}
          onConfirm={
            selectedObject.deleted_at ? () => runAction(selectedObject.id, () => deleteAdminCategory(selectedObject.id), 'admin.categoryDeleted') :
              () => runAction(selectedObject.id, () => softDeleteAdminCategory(selectedObject.id), 'admin.categorySoftDeleted')
          }
          onCancel={() => setIsConfirmModalOpen(false)}
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          loading={isPending}
          confirmText={selectedObject.deleted_at ? t('admin.deleteCategory') : t('admin.softDeleteCategory')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
