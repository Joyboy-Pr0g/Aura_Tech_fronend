import type { MetadataRoute } from 'next';
import { getBlogsServer } from '@/features/blogs/services/blogs-server';
import { getProductsServer } from '@/features/products/services/products-server';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { getSiteUrl } from '@/lib/seo/metadata';
import { isStorefrontComingSoon } from '@/lib/storefront/coming-soon';
import { FALLBACK_WEBSITE_SETTINGS } from '@/lib/website-settings/defaults';

export const revalidate = 3600;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

const STATIC_STOREFRONT_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}> = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/categories', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/blogs', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/terms-of-service', priority: 0.4, changeFrequency: 'yearly' },
];

async function resolveSiteUrl(): Promise<string> {
  try {
    const settings = await getWebsiteSettingsServer();
    return getSiteUrl(settings);
  } catch {
    return getSiteUrl(FALLBACK_WEBSITE_SETTINGS);
  }
}

function toAbsoluteUrl(siteUrl: string, path: string): string {
  if (!path || path === '/') return siteUrl;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function toLastModified(value?: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function getAllProductEntries(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let cursor: string | undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const page = await getProductsServer({ limit: 100, cursor });
      for (const product of page.items) {
        if (!product.slug) continue;
        entries.push({
          url: toAbsoluteUrl(siteUrl, `/products/${product.slug}`),
          lastModified: toLastModified(product.created_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }

      hasMore = page.has_more;
      cursor = page.next_cursor ?? undefined;
      if (!cursor) break;
    }
  } catch {
    // Backend unavailable — static routes still included in sitemap.
  }

  return entries;
}

async function getBlogEntries(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const blogs = await getBlogsServer();
    return blogs
      .filter((blog) => blog.is_published && blog.slug)
      .map((blog) => ({
        url: toAbsoluteUrl(siteUrl, `/blogs/${blog.slug}`),
        lastModified: toLastModified(blog.updated_at || blog.published_at || blog.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await resolveSiteUrl();
  const now = new Date();

  if (isStorefrontComingSoon()) {
    return [
      {
        url: siteUrl,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_STOREFRONT_ROUTES.map((route) => ({
    url: toAbsoluteUrl(siteUrl, route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [productEntries, blogEntries] = await Promise.all([
    getAllProductEntries(siteUrl),
    getBlogEntries(siteUrl),
  ]);

  return [...staticEntries, ...productEntries, ...blogEntries];
}
