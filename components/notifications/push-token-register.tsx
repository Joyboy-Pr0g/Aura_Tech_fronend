'use client';

import { useEffect, useRef } from 'react';
import { User } from '@/lib/types/entities';
import { isFirebaseClientConfigured, requestPushToken } from '@/lib/firebase/client';
import { clientFetch } from '@/lib/api/client';

const PUSH_ROLES = new Set(['customer', 'admin', 'sub_admin']);

interface PushTokenRegisterProps {
  user: User | null;
}

export function PushTokenRegister({ user }: PushTokenRegisterProps) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || !PUSH_ROLES.has(user.role) || registeredRef.current) return;
    if (!isFirebaseClientConfigured()) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    registeredRef.current = true;

    void (async () => {
      try {
        const token = await requestPushToken();
        if (!token) return;

        await clientFetch('/api/notifications/device-tokens', {
          method: 'POST',
          body: { token, platform: 'web' },
        });
      } catch (error) {
        registeredRef.current = false;
        const message = error instanceof Error ? error.message : String(error);
        console.warn('[FCM] Token registration failed:', message, error);
      }
    })();
  }, [user]);

  return null;
}
