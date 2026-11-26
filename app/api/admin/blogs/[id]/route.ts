import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { readJsonField, revalidateBlogStorefront } from '@/lib/storefront/revalidate';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.blog(id),
    method: 'PUT',
    revalidateOnSuccess: () => revalidateBlogStorefront({ slug }),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(_request, {
    path: endpoints.admin.blog(id),
    method: 'DELETE',
    revalidateOnSuccess: () => revalidateBlogStorefront(),
  });
}
