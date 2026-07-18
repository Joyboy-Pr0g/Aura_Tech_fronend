'use client';

import { useCallback, useEffect, useState, useTransition, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MoreHorizontal, Search, Archive, Users, ExternalLink, Plus } from 'lucide-react';
import { User, Role, UserStatus } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TogglePill } from '@/components/ui/toggle-pill';
import { ConfirmModal } from '@/components/ui/models/confirm';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
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
  activateAdminUser,
  deactivateAdminUser,
  deleteAdminUser,
  getAdminUsers,
  restoreAdminUser,
  softDeleteAdminUser,
  resetPasswordAdminUser,
} from '@/features/admin/services/admin-users-client';
import { CreateUserFormModal } from '@/features/admin/components/users/create-user-form-modal';

const ROLES: Role[] = ['admin', 'sub_admin', 'customer'];
const PAGE_SIZE = 20;

const ROLE_VARIANTS: Record<Role, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  sub_admin: 'secondary',
  customer: 'outline',
};

const STATUS_VARIANTS: Record<UserStatus | 'soft_deleted', 'success' | 'danger'> = {
  active: 'success',
  blocked: 'danger',
  soft_deleted: 'danger',
};

interface AdminUsersPanelProps {
  initial: CursorPage<User>;
  initialRole?: Role;
  initialSearch?: string;
  initialIncludeDeleted?: boolean;
}

export function AdminUsersPanel({ initial, initialRole, initialSearch, initialIncludeDeleted }: AdminUsersPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState(initial.items);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [roleFilter, setRoleFilter] = useState(initialRole ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const debouncedSearch = useDebounce<string>(searchInput);
  const [actionId, setActionId] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted ?? false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  useEffect(() => {
    setUsers(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const applyFilters = useCallback(
    (role: string, search: string, includeDeleted: boolean) => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (search.trim()) params.set('search', search.trim());
      params.set('include_deleted', includeDeleted.toString());
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

    applyFilters(roleFilter, debouncedSearch, includeDeleted);
  }, [
    roleFilter,
    debouncedSearch,
    includeDeleted,
    applyFilters,
  ]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminUsers({
        role: (roleFilter || undefined) as Role | undefined,
        search: debouncedSearch.trim() || undefined,
        limit: PAGE_SIZE,
        include_deleted: includeDeleted,
      });
      setUsers(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  }, [roleFilter, debouncedSearch, includeDeleted]);


  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const page = await getAdminUsers({
        role: (roleFilter || undefined) as Role | undefined,
        search: searchInput.trim() || undefined,
        limit: PAGE_SIZE,
        cursor: nextCursor,
        include_deleted: includeDeleted,
      });
      setUsers((prev) => [...prev, ...page.items]);
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
    } catch {
      toast(t('admin.actionFailed'), 'error');
    } finally {
      setActionId(null);
      setSelectedUser(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleConfirmModal = (user: User) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={actionId === user.id}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-dark-900 border-white/10">
        <DropdownMenuSeparator className="bg-white/10" />
        {!user.deleted_at ? (
          <>
            {user.status === 'active' ? (
              <DropdownMenuItem onClick={() => runAction(user.id, () => deactivateAdminUser(user.id), 'admin.userDeactivated')}>
                {t('admin.deactivateUser')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => runAction(user.id, () => activateAdminUser(user.id), 'admin.userActivated')}>
                {t('admin.activateUser')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleConfirmModal(user)}
            >
              {t('admin.softDeleteUser')}
            </DropdownMenuItem>
          </>

        ) : (
          <>
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => runAction(user.id, () => restoreAdminUser(user.id), 'admin.userRestored')}
            >
              {t('admin.restoreUser')}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => handleConfirmModal(user)}
            >
              {t('admin.deleteUser')}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-primary focus:text-primary"
          onClick={() => runAction(user.id, () => resetPasswordAdminUser(user.id), 'admin.passwordReset')}
        >
          {t('admin.resetPassword')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderRoleBadge = (role: Role) => (
    <Badge variant={ROLE_VARIANTS[role]}>{t(`admin.role.${role}`)}</Badge>
  );

  const renderStatusBadge = (status: UserStatus | 'soft_deleted') => (
    <Badge variant={STATUS_VARIANTS[status]}>{t(`admin.userStatus.${status}`)}</Badge>
  );

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.users', icon: Users, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.users')}
        countLabel={t('admin.usersCount', { count: users.length })}
        filters={
          <div className="space-y-3">
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full max-w-xl">
                <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('admin.searchUsers')}
                  className="input-dark ps-9 w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-dark w-full sm:w-auto sm:min-w-[160px]"
                >
                  <option value="">{t('admin.allRoles')}</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{t(`admin.role.${role}`)}</option>
                  ))}
                </select>
                <TogglePill
                  checked={includeDeleted}
                  onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
                  label={t('admin.includeDeleted')}
                  icon={<Archive size={15} />}
                />
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} className="me-1" />
                {t('admin.addUser')}
              </Button>
              </div>
            </div>
          </div>
        }
      />

      {users.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noUsers')}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-5 py-4 font-medium">{t('admin.userName')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.userEmail')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.userPhone')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.userRole')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.userStatus')}</th>
                    <th className="px-5 py-4 font-medium">{t('admin.userJoined')}</th>
                    <th className="admin-table-actions-head">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-white">
                        <Link href={`/admin/users/${user.id}`} className="hover:text-primary-400">
                          {user.full_name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-white/70">{user.email}</td>
                      <td className="px-5 py-4 text-white/50">{user.phone ?? '—'}</td>
                      <td className="px-5 py-4">{renderRoleBadge(user.role)}</td>
                      <td className="px-5 py-4">{renderStatusBadge(user.deleted_at ? 'soft_deleted' : user.status)}</td>
                      <td className="px-5 py-4 text-white/50">{formatDateTime(user.created_at)}</td>
                      <td className="admin-table-actions-cell">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-white hover:bg-white/5"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          {renderActions(user)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="card-dark p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/users/${user.id}`} className="font-semibold text-white truncate hover:text-primary-400 block">
                      {user.full_name}
                    </Link>
                    <p className="text-sm text-white/50 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-white hover:bg-white/5"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    {renderActions(user)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {renderRoleBadge(user.role)}
                  {renderStatusBadge(user.deleted_at ? 'soft_deleted' : user.status)}
                </div>
                <div className="grid grid-cols-1 gap-1 text-sm text-white/50">
                  <p>{user.phone ?? '—'}</p>
                  <p>{formatDateTime(user.created_at)}</p>
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

      {selectedUser && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onCancel={() => setIsConfirmModalOpen(false)}
          onConfirm={() => selectedUser.deleted_at ? runAction(selectedUser.id, () => deleteAdminUser(selectedUser.id), 'admin.userDeleted') :
            runAction(selectedUser.id, () => softDeleteAdminUser(selectedUser.id), 'admin.userSoftDeleted')}
          confirmText={selectedUser.deleted_at ? t('admin.deleteUser') : t('admin.softDeleteUser')}
          cancelText={t('admin.cancel')}
          name={selectedUser.full_name}
          setIsOpen={setIsConfirmModalOpen}
          loading={isPending}
          confirmVariant={selectedUser.deleted_at ? 'danger' : 'primary'}
          cancelVariant="outline"
        />
      )}

      <CreateUserFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
