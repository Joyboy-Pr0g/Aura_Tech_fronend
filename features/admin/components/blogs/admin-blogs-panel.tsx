'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { BlogPost } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';
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
import { deleteAdminBlog, getAdminBlogs } from '@/features/admin/services/admin-blogs-client';
import { BlogFormModal, type BlogFormMode } from '@/features/admin/components/blogs/blog-form-modal';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminLastActionLabel } from '@/features/admin/components/audit/admin-last-action-label';

interface AdminBlogsPanelProps {
  initialBlogs: BlogPost[];
}

export function AdminBlogsPanel({ initialBlogs }: AdminBlogsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<BlogFormMode | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteBlog, setDeleteBlog] = useState<BlogPost | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const latestActions = useAdminLatestActions('blog', blogs.map((b) => b.id));

  useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  const refresh = () => {
    startTransition(async () => {
      try {
        setBlogs(await getAdminBlogs());
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteBlog) return;
    startTransition(async () => {
      try {
        await deleteAdminBlog(deleteBlog.id);
        toast(t('admin.blogDeleted'), 'success');
        setIsDeleteOpen(false);
        setDeleteBlog(null);
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
          { labelKey: 'admin.blogsTitle', icon: BookOpen, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.blogsTitle')}
        countLabel={t('admin.blogsCount', { count: blogs.length })}
        filters={
          <Button onClick={() => { setFormMode({ type: 'create' }); setIsFormOpen(true); }}>
            <Plus size={16} />
            {t('admin.addBlog')}
          </Button>
        }
      />

      {blogs.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noBlogs')}</p>
        </div>
      ) : (
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="admin-table-head">
                  <th className="px-5 py-4 font-medium">{t('admin.blogTitle')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.blogSlug')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.blogStatus')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.blogPublishedAt')}</th>
                  <th className="px-5 py-4 font-medium">{t('admin.audit')}</th>
                  <th className="admin-table-actions-head">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-white">{blog.title}</td>
                    <td className="px-5 py-4 font-mono text-primary-400">{blog.slug}</td>
                    <td className="px-5 py-4">
                      <Badge variant={blog.is_published ? 'success' : 'secondary'}>
                        {blog.is_published ? t('admin.published') : t('admin.draft')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      {blog.published_at ? formatDateTime(blog.published_at) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <AdminLastActionLabel action={latestActions[blog.id]} />
                    </td>
                    <td className="admin-table-actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5">
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-dark-900 border-white/10">
                          {blog.is_published && (
                            <DropdownMenuItem asChild>
                              <Link href={`/blogs/${blog.slug}`} target="_blank">
                                <ExternalLink size={14} className="me-2" />
                                {t('admin.viewBlog')}
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setFormMode({ type: 'edit', blog }); setIsFormOpen(true); }}>
                            <Pencil size={14} className="me-2" />
                            {t('admin.editBlog')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger focus:text-danger"
                            onClick={() => { setDeleteBlog(blog); setIsDeleteOpen(true); }}
                          >
                            <Trash2 size={14} className="me-2" />
                            {t('admin.deleteBlog')}
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

      <BlogFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        onSuccess={refresh}
      />

      {deleteBlog && (
        <ConfirmModal
          name={deleteBlog.title}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteOpen(false);
            setDeleteBlog(null);
          }}
          isOpen={isDeleteOpen}
          setIsOpen={setIsDeleteOpen}
          loading={isPending}
          confirmText={t('admin.deleteBlog')}
          cancelText={t('admin.cancel')}
          confirmVariant="danger"
          cancelVariant="outline"
        />
      )}
    </div>
  );
}
