import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: `/products/${id}/questions`,
    method: 'GET',
    requireAuth: false,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, {
    path: `/products/${id}/questions`,
    method: 'POST',
  });
}
