'use client';

import dynamic from 'next/dynamic';

const GamingCircuitBoard = dynamic(
  () => import('./GamingCircuitBoard').then((mod) => ({ default: mod.GamingCircuitBoard })),
  { ssr: false, loading: () => null },
);

/**
 * Homepage background scoped to page content — ends before the footer.
 * Uses a sticky viewport canvas so the 3D scene stays visible while scrolling
 * through sections, then scrolls away when the footer enters view.
 */
export function HomePageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-[#0F0F0F]" />
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <GamingCircuitBoard />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, transparent 0%, rgba(15,15,15,0.35) 55%, rgba(5,5,7,0.75) 100%)',
        }}
      />
    </div>
  );
}
