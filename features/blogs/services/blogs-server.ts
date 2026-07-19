import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { BlogPost } from '@/lib/types/entities';

export async function getBlogsServer(): Promise<BlogPost[]> {
  try {
    const res = await serverFetch<BlogPost[]>(
      endpoints.blogs.root,
      { cacheProfile: 'catalog', withAuth: false },
      ['blogs'],
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getBlogBySlugServer(slug: string): Promise<BlogPost | null> {
  try {
    const res = await serverFetch<BlogPost>(
      endpoints.blogs.bySlug(slug),
      { cacheProfile: 'catalog', withAuth: false },
      ['blogs', `blog-${slug}`],
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}
