import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { readJsonField, revalidateProductStorefront } from '@/lib/storefront/revalidate';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.product(id), method: 'GET' });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = await readJsonField(request, 'slug');
  return proxyToBackend(request, {
    path: endpoints.admin.product(id),
    method: 'PUT',
    revalidateOnSuccess: () => revalidateProductStorefront({ id, slug }),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.product(id),
    method: 'DELETE',
    revalidateOnSuccess: () => revalidateProductStorefront({ id }),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: endpoints.admin.productStock(id),
    method: 'PATCH',
    revalidateOnSuccess: () => revalidateProductStorefront({ id }),
  });
}
