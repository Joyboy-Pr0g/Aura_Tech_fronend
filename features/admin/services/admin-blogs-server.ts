import { serverFetch } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { BlogPost } from '@/lib/types/entities';

export async function getAdminBlogsServer(): Promise<BlogPost[]> {
  const res = await serverFetch<BlogPost[]>(endpoints.admin.blogs);
  return res.data ?? [];
}
