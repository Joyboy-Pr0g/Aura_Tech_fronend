import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.user(id), method: 'GET' });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.user(id), method: 'PUT' });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyToBackend(request, { path: endpoints.admin.user(id), method: 'DELETE' });
}
