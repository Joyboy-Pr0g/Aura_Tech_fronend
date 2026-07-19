import { serverFetch } from '@/lib/api/server';
import { Category } from '@/lib/types/entities';
import { endpoints } from '@/lib/api/endpoints';

export async function getCategoriesServer(): Promise<Category[]> {
  try {
    const res = await serverFetch<Category[]>(
      endpoints.categories.root,
      { cacheProfile: 'categories', withAuth: false },
      ['categories'],
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getCategoryBySlugServer(slug: string): Promise<Category | null> {
  const res = await serverFetch<Category | null>(
    endpoints.categories.bySlug(slug),
    { cacheProfile: 'categories', withAuth: false },
    ['categories', `category-${slug}`],
  );
  return res.data ?? null;
}

export async function getCategoryByIdServer(id: string): Promise<Category | null> {
  const res = await serverFetch<Category | null>(
    endpoints.categories.byId(id),
    { cacheProfile: 'categories', withAuth: false },
    ['categories', `category-${id}`],
  );
  return res.data ?? null;
}
