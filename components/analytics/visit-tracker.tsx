'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'aura_visitor_id';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname === '/coming-soon') return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    void fetch('/api/visits', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        visitor_id: getVisitorId(),
        referrer: document.referrer || null,
      }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
