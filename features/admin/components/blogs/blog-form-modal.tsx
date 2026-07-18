'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BlogPost } from '@/lib/types/entities';
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
import { createAdminBlog, updateAdminBlog } from '@/features/admin/services/admin-blogs-client';
import { ImageIcon, Trash2 } from 'lucide-react';

const blogFormSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(220).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().trim().min(10).max(50000),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional(),
  is_published: z.boolean().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export type BlogFormMode =
  | { type: 'create' }
  | { type: 'edit'; blog: BlogPost };

interface BlogFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BlogFormMode | null;
  onSuccess: () => void;
}

export function BlogFormModal({ open, onOpenChange, mode, onSuccess }: BlogFormModalProps) {
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const isEdit = mode?.type === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      meta_title: '',
      meta_description: '',
      is_published: false,
    },
  });

  const isPublished = watch('is_published');
  const currentCoverUrl = isEdit && mode?.type === 'edit' ? mode.blog.cover_image_url : null;
  const displayCover = removeCover ? null : coverPreview ?? currentCoverUrl;

  useEffect(() => {
    if (!open || !mode) return;
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(false);
    if (mode.type === 'edit') {
      reset({
        title: mode.blog.title,
        slug: mode.blog.slug,
        excerpt: mode.blog.excerpt ?? '',
        content: mode.blog.content,
        meta_title: mode.blog.meta_title ?? '',
        meta_description: mode.blog.meta_description ?? '',
        is_published: mode.blog.is_published,
      });
    } else {
      reset({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        meta_title: '',
        meta_description: '',
        is_published: false,
      });
    }
  }, [open, mode, reset]);

  const onSubmit = async (values: BlogFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        slug: values.slug?.trim() || undefined,
        excerpt: values.excerpt?.trim() || undefined,
        meta_title: values.meta_title?.trim() || undefined,
        meta_description: values.meta_description?.trim() || undefined,
        cover_image: coverFile,
        ...(isEdit && removeCover ? { remove_cover_image: true } : {}),
      };
      if (isEdit && mode?.type === 'edit') {
        await updateAdminBlog(mode.blog.id, payload);
        toast(t('admin.blogUpdated'), 'success');
      } else {
        await createAdminBlog(payload);
        toast(t('admin.blogCreated'), 'success');
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
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{isEdit ? t('admin.editBlog') : t('admin.addBlog')}</ModalTitle>
          <ModalDescription>{isEdit ? t('admin.editBlogDesc') : t('admin.addBlogDesc')}</ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blog-title">{t('admin.blogTitle')}</Label>
              <Input id="blog-title" className="input-dark" {...register('title')} />
              {errors.title && <p className="text-sm text-danger">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-slug">{t('admin.blogSlug')}</Label>
              <Input id="blog-slug" className="input-dark" placeholder={t('admin.blogSlugHint')} {...register('slug')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-excerpt">{t('admin.blogExcerpt')}</Label>
              <textarea id="blog-excerpt" rows={2} className="input-dark w-full resize-y" {...register('excerpt')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-content">{t('admin.blogContent')}</Label>
              <textarea id="blog-content" rows={8} className="input-dark w-full resize-y min-h-[160px]" {...register('content')} />
              {errors.content && <p className="text-sm text-danger">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blog-meta-title">{t('admin.websiteMetaTitle')}</Label>
                <Input id="blog-meta-title" className="input-dark" {...register('meta_title')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-meta-description">{t('admin.websiteMetaDescription')}</Label>
                <textarea id="blog-meta-description" rows={2} className="input-dark w-full resize-y" {...register('meta_description')} />
              </div>
            </div>
            <div className="space-y-3">
              <Label>{t('admin.blogCoverImage')}</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex h-28 w-full sm:w-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  {displayCover ? (
                    coverPreview ? (
                      <img src={displayCover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ProductImage src={displayCover} alt="" width={192} height={112} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <ImageIcon size={28} className="text-white/20" />
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="input-dark"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setCoverFile(file);
                      setRemoveCover(false);
                      setCoverPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {currentCoverUrl && !removeCover && (
                    <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setRemoveCover(true)}>
                      <Trash2 size={14} className="me-1" />
                      {t('admin.removeImage')}
                    </Button>
                  )}
                  {removeCover && (
                    <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setRemoveCover(false)}>
                      {t('admin.undo')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!isPublished} onChange={(e) => setValue('is_published', e.target.checked)} />
              <span className="text-sm text-white/80">{t('admin.blogPublished')}</span>
            </label>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : isEdit ? t('admin.saveBlog') : t('admin.createBlog')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
