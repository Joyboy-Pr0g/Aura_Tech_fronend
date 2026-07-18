import { clientFetch } from '@/lib/api/client';
import { AppNotification } from '@/lib/types/entities';

export const NOTIFICATIONS_REFRESH_EVENT = 'aura:notifications-refresh';

export function dispatchNotificationsRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  const res = await clientFetch<AppNotification[]>('/api/notifications');
  return res.data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await clientFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function isNotificationUnread(notification: AppNotification): boolean {
  return notification.read_at == null;
}
