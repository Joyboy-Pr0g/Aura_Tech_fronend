'use client';

import { useEffect, useState } from 'react';
import { getAdminNavBadges, AdminNavBadges } from '@/features/admin/services/admin-nav-badges-client';
import { NOTIFICATIONS_REFRESH_EVENT } from '@/features/notifications/services/notifications-client';

const EMPTY: AdminNavBadges = {
  pending_orders: 0,
  pending_payments: 0,
  unanswered_questions: 0,
  pending_refunds: 0,
  suspicious_users: 0,
};

export function useAdminNavBadges(enabled = true) {
  const [badges, setBadges] = useState<AdminNavBadges>(EMPTY);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getAdminNavBadges();
        if (!cancelled) setBadges(data);
      } catch {
        if (!cancelled) setBadges(EMPTY);
      }
    };

    void load();
    const interval = setInterval(load, 60000);
    const onRefresh = () => void load();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    };
  }, [enabled]);

  return badges;
}
