import { clientFetch } from '@/lib/api/client';
import { bffPath } from '@/lib/api/bff';
import { endpoints } from '@/lib/api/endpoints';
import { BlogPost } from '@/lib/types/entities';

export interface CreateBlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  cover_image?: File | null;
}

export type UpdateBlogPayload = Partial<Omit<CreateBlogPayload, 'cover_image'>> & {
  cover_image?: File | null;
  remove_cover_image?: boolean;
};

function toFormData(data: CreateBlogPayload | UpdateBlogPayload): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (key === 'cover_image' && value instanceof File) {
      formData.append('cover_image', value);
      continue;
    }
    if (key === 'cover_image') continue;
    if (typeof value === 'boolean') {
      formData.append(key, String(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export async function getAdminBlogs(): Promise<BlogPost[]> {
  const res = await clientFetch<BlogPost[]>(bffPath(endpoints.admin.blogs));
  return res.data ?? [];
}

export async function createAdminBlog(data: CreateBlogPayload): Promise<BlogPost> {
  const res = await clientFetch<BlogPost>(bffPath(endpoints.admin.blogs), {
    method: 'POST',
    body: toFormData(data),
  });
  return res.data!;
}

export async function updateAdminBlog(id: string, data: UpdateBlogPayload): Promise<BlogPost> {
  const res = await clientFetch<BlogPost>(bffPath(endpoints.admin.blog(id)), {
    method: 'PUT',
    body: toFormData(data),
  });
  return res.data!;
}

export async function deleteAdminBlog(id: string): Promise<void> {
  await clientFetch(bffPath(endpoints.admin.blog(id)), { method: 'DELETE' });
}
