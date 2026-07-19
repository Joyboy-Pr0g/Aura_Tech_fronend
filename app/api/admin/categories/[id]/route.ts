import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { readJsonField, revalidateCategoryStorefront } from '@/lib/storefront/revalidate';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.category(id), method: 'GET' });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.category(id),
    method: 'PUT',
    revalidateOnSuccess: () => revalidateCategoryStorefront({ id, slug }),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.category(id),
    method: 'DELETE',
    revalidateOnSuccess: () => revalidateCategoryStorefront({ id }),
  });
}
