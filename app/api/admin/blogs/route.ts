import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.blogs, method: 'GET' });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.blogs, method: 'POST' });
}
