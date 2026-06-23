'use client';

import dynamic from 'next/dynamic';
import type { ScrollResponsiveBackgroundProps } from './ScrollResponsiveBackground';

const ScrollResponsiveBackground = dynamic(
  () =>
    import('./ScrollResponsiveBackground').then((mod) => ({
      default: mod.ScrollResponsiveBackground,
    })),
  { ssr: false, loading: () => null },
);

type BackgroundShellProps = ScrollResponsiveBackgroundProps;

/**
 * Client shell that lazy-loads the Three.js canvas (SSR-safe).
 */
export function BackgroundShell(props: BackgroundShellProps) {
  return (
    <>
      <ScrollResponsiveBackground {...props} />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, transparent 0%, rgba(15,15,15,0.35) 55%, rgba(5,5,7,0.75) 100%)',
        }}
      />
    </>
  );
}
