import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  return proxyToBackend(request, {
    path: endpoints.products.bySlug(slug),
    method: 'GET',
    requireAuth: false,
  });
}
