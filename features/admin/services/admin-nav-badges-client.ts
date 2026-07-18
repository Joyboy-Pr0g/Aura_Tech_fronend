import { clientFetch } from '@/lib/api/client';
import { bffPath } from '@/lib/api/bff';
import { endpoints } from '@/lib/api/endpoints';

export interface AdminNavBadges {
  pending_orders: number;
  pending_payments: number;
  unanswered_questions: number;
  pending_refunds: number;
}

export async function getAdminNavBadges(): Promise<AdminNavBadges> {
  const res = await clientFetch<AdminNavBadges>(bffPath(endpoints.admin.navBadges));
  return res.data ?? { pending_orders: 0, pending_payments: 0, unanswered_questions: 0, pending_refunds: 0 };
}
