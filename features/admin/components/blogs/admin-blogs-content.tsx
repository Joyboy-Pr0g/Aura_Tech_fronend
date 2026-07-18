import { getAdminBlogsServer } from '@/features/admin/services/admin-blogs-server';
import { AdminBlogsPanel } from '@/features/admin/components/blogs/admin-blogs-panel';

export async function AdminBlogsContent() {
  const blogs = await getAdminBlogsServer();
  return <AdminBlogsPanel initialBlogs={blogs} />;
}
