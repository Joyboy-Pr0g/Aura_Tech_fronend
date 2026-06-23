import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  return proxyToBackend(request, {
    path: endpoints.payments.order(orderId),
    method: 'GET',
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  return proxyToBackend(request, {
    path: endpoints.payments.order(orderId),
    method: 'POST',
  });
}
