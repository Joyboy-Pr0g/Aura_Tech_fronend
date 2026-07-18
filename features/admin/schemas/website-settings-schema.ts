import { z } from 'zod';

export function createWebsiteSettingsSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(1, t('validation.titleRequired')).max(200),
    website_email: z.union([z.string().email(t('validation.invalidEmail')), z.literal('')]).optional(),
    website_phone: z.string().max(30).optional(),
    facebook: z.string().max(500).optional(),
    instagram: z.string().max(500).optional(),
    whatsapp: z.string().max(500).optional(),
    tiktok: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(2000).optional(),
    meta_keywords: z.string().max(500).optional(),
    site_url: z.union([z.string().url(t('validation.invalidUrl')), z.literal('')]).optional(),
    twitter_card: z.enum(['summary', 'summary_large_image']).optional(),
    twitter_handle: z.string().max(100).optional(),
    default_locale: z.string().max(10).optional(),
    theme_color: z.string().max(20).optional(),
    robots: z.string().max(100).optional(),
    remove_header_logo: z.boolean().optional(),
    remove_footer_logo: z.boolean().optional(),
    remove_favicon: z.boolean().optional(),
    remove_og_image: z.boolean().optional(),
  });
}

export type WebsiteSettingsFormValues = z.infer<ReturnType<typeof createWebsiteSettingsSchema>>;
