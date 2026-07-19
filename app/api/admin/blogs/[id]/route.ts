import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { readJsonField, revalidateBlogStorefront } from '@/lib/storefront/revalidate';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.blog(params.id),
    method: 'PUT',
    revalidateOnSuccess: () => revalidateBlogStorefront({ slug }),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(_request, {
    path: endpoints.admin.blog(params.id),
    method: 'DELETE',
    revalidateOnSuccess: () => revalidateBlogStorefront(),
  });
}
