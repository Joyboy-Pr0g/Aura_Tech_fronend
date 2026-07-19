'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'aura_visitor_id';
const VISITED_PATHS_KEY = 'aura_visited_paths';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function hasLoggedPath(pathname: string): boolean {
  try {
    const raw = sessionStorage.getItem(VISITED_PATHS_KEY);
    const paths = raw ? (JSON.parse(raw) as string[]) : [];
    return paths.includes(pathname);
  } catch {
    return false;
  }
}

function markPathLogged(pathname: string): void {
  try {
    const raw = sessionStorage.getItem(VISITED_PATHS_KEY);
    const paths = raw ? (JSON.parse(raw) as string[]) : [];
    if (!paths.includes(pathname)) {
      paths.push(pathname);
      sessionStorage.setItem(VISITED_PATHS_KEY, JSON.stringify(paths));
    }
  } catch {
    sessionStorage.setItem(VISITED_PATHS_KEY, JSON.stringify([pathname]));
  }
}

export function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname === '/coming-soon') return;
    if (lastPath.current === pathname || hasLoggedPath(pathname)) return;
    lastPath.current = pathname;

    void fetch('/api/visits', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        path: pathname,
        visitor_id: getVisitorId(),
        referrer: document.referrer || null,
      }),
    })
      .then((response) => {
        if (response.ok) {
          markPathLogged(pathname);
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
