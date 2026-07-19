import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { revalidateProductStorefront } from '@/lib/storefront/revalidate';

const ALLOWED_ACTIONS = ['soft-delete', 'restore', 'set-primary-image', 'remove-image'] as const;

interface RouteContext {
  params: Promise<{ id: string; action: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id, action } = await params;
  if (!ALLOWED_ACTIONS.includes(action as (typeof ALLOWED_ACTIONS)[number])) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return proxyToBackend(request, {
    path: endpoints.admin.productAction(id, action as (typeof ALLOWED_ACTIONS)[number]),
    method: 'POST',
    revalidateOnSuccess: () => revalidateProductStorefront({ id }),
  });
}
