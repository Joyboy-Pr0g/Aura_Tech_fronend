import { serverFetch } from '@/lib/api/server';
import { Category } from '@/lib/types/entities';
import { endpoints } from '@/lib/api/endpoints';

export async function getCategoriesServer(): Promise<Category[]> {
  const res = await serverFetch<Category[]>(endpoints.categories.root);
  return res.data ?? [];
}

export async function getCategoryBySlugServer(slug: string): Promise<Category | null> {
  const res = await serverFetch<Category | null>(endpoints.categories.bySlug(slug));
  return res.data ?? null;
}

export async function getCategoryByIdServer(id: string): Promise<Category | null> {
  const res = await serverFetch<Category | null>(endpoints.categories.byId(id));
  return res.data ?? null;
}
