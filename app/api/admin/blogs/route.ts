import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { readJsonField, revalidateBlogStorefront } from '@/lib/storefront/revalidate';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.blogs, method: 'GET' });
}

export async function POST(request: NextRequest) {
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.blogs,
    method: 'POST',
    revalidateOnSuccess: () => revalidateBlogStorefront({ slug }),
  });
}
