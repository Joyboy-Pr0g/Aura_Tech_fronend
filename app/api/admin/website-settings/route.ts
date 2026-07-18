import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.websiteSettings, method: 'GET' });
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, { path: endpoints.admin.websiteSettings, method: 'PATCH' });
}
