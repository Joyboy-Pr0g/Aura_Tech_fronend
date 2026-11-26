import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';

const CLIENT_IP_HEADER = 'x-real-ip';

function readClientIp(source: Pick<Headers, 'get'>): string | undefined {
  return source.get(CLIENT_IP_HEADER)?.trim() || undefined;
}

export function getClientIp(request: NextRequest): string | undefined {
  return readClientIp(request.headers);
}

export async function getServerClientIp(): Promise<string | undefined> {
  return readClientIp(await headers());
}
