import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

const ACTION_PATHS = {
  dismiss: endpoints.admin.suspiciousUserDismiss,
  block: endpoints.admin.suspiciousUserBlock,
  'delete-user': endpoints.admin.suspiciousUserDelete,
} as const;

interface RouteContext {
  params: Promise<{ id: string; action: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id, action } = await params;
  const pathBuilder = ACTION_PATHS[action as keyof typeof ACTION_PATHS];
  if (!pathBuilder) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return proxyToBackend(request, {
    path: pathBuilder(id),
    method: 'POST',
  });
}
