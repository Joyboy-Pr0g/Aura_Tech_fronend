'use client';

import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { toast } from '@/components/ui/Toaster';
import { isFirebaseClientConfigured, subscribeForegroundMessages } from '@/lib/firebase/client';
import { dispatchNotificationsRefresh } from '@/features/notifications/services/notifications-client';

function formatPushMessage(payload: firebase.messaging.MessagePayload): string | null {
  const title = payload.notification?.title ?? payload.data?.title;
  const body = payload.notification?.body ?? payload.data?.body;
  if (title && body) return `${title} — ${body}`;
  return title ?? body ?? null;
}

export function ForegroundMessageHandler() {
  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;

    const unsubscribe = subscribeForegroundMessages((payload) => {
      dispatchNotificationsRefresh();
      const message = formatPushMessage(payload);
      if (message) toast(message, 'info');
    });

    return unsubscribe;
  }, []);

  return null;
}
