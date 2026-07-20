'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, ImageIcon, Link2, Mail, Phone, Search, Settings, Trash2 } from 'lucide-react';
import { WebsiteSettings } from '@/lib/types/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage } from '@/components/ui/product-image';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { toast } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import {
  createWebsiteSettingsSchema,
  WebsiteSettingsFormValues,
} from '@/features/admin/schemas/website-settings-schema';
import { updateAdminWebsiteSettings } from '@/features/admin/services/admin-website-settings-client';

interface AdminWebsiteSettingsPanelProps {
  initialSettings: WebsiteSettings;
}

function toFormValues(settings: WebsiteSettings): WebsiteSettingsFormValues {
  return {
    title: settings.title,
    website_email: settings.website_email ?? '',
    website_phone: settings.website_phone ?? '',
    facebook: settings.facebook ?? '',
    instagram: settings.instagram ?? '',
    whatsapp: settings.whatsapp ?? '',
    tiktok: settings.tiktok ?? '',
    description: settings.description ?? '',
    meta_title: settings.meta_title ?? '',
    meta_description: settings.meta_description ?? '',
    meta_keywords: settings.meta_keywords ?? '',
    site_url: settings.site_url ?? '',
    twitter_card: (settings.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
    twitter_handle: settings.twitter_handle ?? '',
    default_locale: settings.default_locale ?? 'en_US',
    theme_color: settings.theme_color ?? '#00d9ff',
    robots: settings.robots ?? 'index, follow',
    sar_to_yer:
      settings.sar_to_yer != null && settings.sar_to_yer !== ''
        ? Number(settings.sar_to_yer)
        : undefined,
    remove_header_logo: false,
    remove_footer_logo: false,
    remove_favicon: false,
    remove_og_image: false,
  };
}

export function AdminWebsiteSettingsPanel({ initialSettings }: AdminWebsiteSettingsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const websiteSettingsSchema = useMemo(() => createWebsiteSettingsSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WebsiteSettingsFormValues>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: toFormValues(initialSettings),
  });

  const removeHeaderLogo = watch('remove_header_logo');
  const removeFooterLogo = watch('remove_footer_logo');
  const removeFavicon = watch('remove_favicon');
  const removeOgImage = watch('remove_og_image');

  useEffect(() => {
    setSettings(initialSettings);
    reset(toFormValues(initialSettings));
    setHeaderFile(null);
    setFooterFile(null);
    setFaviconFile(null);
    setOgImageFile(null);
    setHeaderPreview(null);
    setFooterPreview(null);
    setFaviconPreview(null);
    setOgImagePreview(null);
  }, [initialSettings, reset]);

  const handleAssetChange = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    removeField: 'remove_header_logo' | 'remove_footer_logo' | 'remove_favicon' | 'remove_og_image',
  ) => {
    setFile(file);
    setValue(removeField, false);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (values: WebsiteSettingsFormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('website_email', values.website_email ?? '');
      formData.append('website_phone', values.website_phone ?? '');
      formData.append('facebook', values.facebook ?? '');
      formData.append('instagram', values.instagram ?? '');
      formData.append('whatsapp', values.whatsapp ?? '');
      formData.append('tiktok', values.tiktok ?? '');
      formData.append('description', values.description ?? '');
      formData.append('meta_title', values.meta_title ?? '');
      formData.append('meta_description', values.meta_description ?? '');
      formData.append('meta_keywords', values.meta_keywords ?? '');
      formData.append('site_url', values.site_url ?? '');
      formData.append('twitter_card', values.twitter_card ?? 'summary_large_image');
      formData.append('twitter_handle', values.twitter_handle ?? '');
      formData.append('default_locale', values.default_locale ?? 'en_US');
      formData.append('theme_color', values.theme_color ?? '#00d9ff');
      formData.append('robots', values.robots ?? 'index, follow');
      if (values.sar_to_yer != null) {
        formData.append('sar_to_yer', String(values.sar_to_yer));
      } else {
        formData.append('sar_to_yer', '');
      }
      formData.append('remove_header_logo', String(values.remove_header_logo ?? false));
      formData.append('remove_footer_logo', String(values.remove_footer_logo ?? false));
      formData.append('remove_favicon', String(values.remove_favicon ?? false));
      formData.append('remove_og_image', String(values.remove_og_image ?? false));
      if (headerFile) formData.append('header_logo', headerFile);
      if (footerFile) formData.append('footer_logo', footerFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (ogImageFile) formData.append('og_image', ogImageFile);

      const updated = await updateAdminWebsiteSettings(formData);
      setSettings(updated);
      reset(toFormValues(updated));
      setHeaderFile(null);
      setFooterFile(null);
      setFaviconFile(null);
      setOgImageFile(null);
      setHeaderPreview(null);
      setFooterPreview(null);
      setFaviconPreview(null);
      setOgImagePreview(null);
      toast(t('admin.websiteSettingsUpdated'), 'success');
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderImageField = (
    label: string,
    hint: string | undefined,
    currentUrl: string | null,
    preview: string | null,
    removeField: 'remove_header_logo' | 'remove_footer_logo' | 'remove_favicon' | 'remove_og_image',
    removeValue: boolean | undefined,
    onFileChange: (file: File | null) => void,
    inputId: string,
    accept = 'image/jpeg,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon',
  ) => {
    const displayUrl = removeValue ? null : preview ?? currentUrl;

    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor={inputId}>{label}</Label>
          {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex h-24 w-full sm:w-40 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {displayUrl ? (
              preview ? (
                <img src={displayUrl} alt={label} className="h-full w-full object-contain p-2" />
              ) : (
                <ProductImage
                  src={displayUrl}
                  alt={label}
                  width={160}
                  height={96}
                  className="h-full w-full object-contain p-2"
                />
              )
            ) : (
              <ImageIcon size={28} className="text-white/20" />
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <Input
              id={inputId}
              type="file"
              accept={accept}
              className="input-dark"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {currentUrl && !removeValue && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setValue(removeField, true)}
              >
                <Trash2 size={14} className="me-1" />
                {t('admin.removeImage')}
              </Button>
            )}
            {removeValue && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setValue(removeField, false)}
              >
                {t('admin.undo')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6', submitting && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.websiteSettingsTitle', icon: Settings, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.websiteSettingsTitle')}
        countLabel={settings.title}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-7xl">
        <section className="card-dark p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">{t('admin.websiteGeneralSection')}</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t('admin.websiteTitle')}</Label>
            <Input id="title" className="input-dark" {...register('title')} />
            {errors.title && <p className="text-sm text-danger">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('admin.websiteDescription')}</Label>
            <textarea
              id="description"
              rows={4}
              className="input-dark w-full resize-y min-h-[100px]"
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-danger">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sar_to_yer">{t('admin.websiteSarToYer')}</Label>
            <Input
              id="sar_to_yer"
              type="number"
              min="0.01"
              step="0.1"
              className="input-dark"
              placeholder="140"
              {...register('sar_to_yer', { valueAsNumber: true })}
            />
            <p className="text-xs text-white/40">{t('admin.websiteSarToYerHint')}</p>
            {errors.sar_to_yer && <p className="text-sm text-danger">{errors.sar_to_yer.message}</p>}
          </div>
        </section>

        <section className="card-dark p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">{t('admin.websiteSeoSection')}</h2>
          </div>
          <p className="text-sm text-white/50">{t('admin.websiteSeoHint')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="site_url">{t('admin.websiteSiteUrl')}</Label>
              <Input id="site_url" className="input-dark" placeholder="https://auratech.com" {...register('site_url')} />
              {errors.site_url && <p className="text-sm text-danger">{errors.site_url.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meta_title">{t('admin.websiteMetaTitle')}</Label>
              <Input id="meta_title" className="input-dark" {...register('meta_title')} />
              {errors.meta_title && <p className="text-sm text-danger">{errors.meta_title.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meta_description">{t('admin.websiteMetaDescription')}</Label>
              <textarea
                id="meta_description"
                rows={3}
                className="input-dark w-full resize-y min-h-[80px]"
                {...register('meta_description')}
              />
              {errors.meta_description && <p className="text-sm text-danger">{errors.meta_description.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meta_keywords">{t('admin.websiteMetaKeywords')}</Label>
              <Input id="meta_keywords" className="input-dark" placeholder="gaming, mobile, yemen" {...register('meta_keywords')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_locale">{t('admin.websiteDefaultLocale')}</Label>
              <Input id="default_locale" className="input-dark" placeholder="en_US" {...register('default_locale')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme_color">{t('admin.websiteThemeColor')}</Label>
              <Input id="theme_color" className="input-dark" placeholder="#00d9ff" {...register('theme_color')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="robots">{t('admin.websiteRobots')}</Label>
              <Input id="robots" className="input-dark" placeholder="index, follow" {...register('robots')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_card">{t('admin.websiteTwitterCard')}</Label>
              <select id="twitter_card" className="input-dark w-full" {...register('twitter_card')}>
                <option value="summary_large_image">{t('admin.twitterCardLarge')}</option>
                <option value="summary">{t('admin.twitterCardSummary')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_handle">{t('admin.websiteTwitterHandle')}</Label>
              <Input id="twitter_handle" className="input-dark" placeholder="@auratech" {...register('twitter_handle')} />
            </div>
          </div>
          {renderImageField(
            t('admin.websiteFavicon'),
            t('admin.websiteFaviconHint'),
            settings.favicon_url,
            faviconPreview,
            'remove_favicon',
            removeFavicon,
            (file) => handleAssetChange(file, setFaviconFile, setFaviconPreview, 'remove_favicon'),
            'favicon',
          )}
          {renderImageField(
            t('admin.websiteOgImage'),
            t('admin.websiteOgImageHint'),
            settings.og_image_url,
            ogImagePreview,
            'remove_og_image',
            removeOgImage,
            (file) => handleAssetChange(file, setOgImageFile, setOgImagePreview, 'remove_og_image'),
            'og_image',
          )}
        </section>

        <section className="card-dark p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">{t('admin.websiteContactSection')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_email">{t('admin.websiteEmail')}</Label>
              <Input id="website_email" type="email" className="input-dark" {...register('website_email')} />
              {errors.website_email && <p className="text-sm text-danger">{errors.website_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_phone">{t('admin.websitePhone')}</Label>
              <div className="relative">
                <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input id="website_phone" className="input-dark ps-9" {...register('website_phone')} />
              </div>
              {errors.website_phone && <p className="text-sm text-danger">{errors.website_phone.message}</p>}
            </div>
          </div>
        </section>

        <section className="card-dark p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">{t('admin.websiteLogosSection')}</h2>
          </div>
          {renderImageField(
            t('admin.websiteHeaderLogo'),
            undefined,
            settings.header_logo_url,
            headerPreview,
            'remove_header_logo',
            removeHeaderLogo,
            (file) => handleAssetChange(file, setHeaderFile, setHeaderPreview, 'remove_header_logo'),
            'header_logo',
          )}
          {renderImageField(
            t('admin.websiteFooterLogo'),
            undefined,
            settings.footer_logo_url,
            footerPreview,
            'remove_footer_logo',
            removeFooterLogo,
            (file) => handleAssetChange(file, setFooterFile, setFooterPreview, 'remove_footer_logo'),
            'footer_logo',
          )}
        </section>

        <section className="card-dark p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">{t('admin.websiteSocialSection')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">{t('admin.websiteFacebook')}</Label>
              <Input id="facebook" className="input-dark" placeholder={t('admin.urlPlaceholderFacebook')} {...register('facebook')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">{t('admin.websiteInstagram')}</Label>
              <Input id="instagram" className="input-dark" placeholder={t('admin.urlPlaceholderInstagram')} {...register('instagram')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t('admin.websiteWhatsapp')}</Label>
              <Input id="whatsapp" className="input-dark" placeholder={t('admin.urlPlaceholderWhatsapp')} {...register('whatsapp')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">{t('admin.websiteTiktok')}</Label>
              <Input id="tiktok" className="input-dark" placeholder={t('admin.urlPlaceholderTiktok')} {...register('tiktok')} />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? t('common.loading') : t('admin.saveWebsiteSettings')}
          </Button>
        </div>
      </form>
    </div>
  );
}
