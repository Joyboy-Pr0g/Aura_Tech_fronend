'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ForegroundMessageHandler } from '@/components/notifications/foreground-message-handler';

export function AppProviders() {
  return (
    <>
      <ForegroundMessageHandler />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
