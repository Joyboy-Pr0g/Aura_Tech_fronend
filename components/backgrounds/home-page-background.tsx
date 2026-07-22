'use client';

import dynamic from 'next/dynamic';

const HomeShowcaseScene = dynamic(
  () => import('./home-showcase-scene').then((m) => ({ default: m.HomeShowcaseScene })),
  { ssr: false, loading: () => null },
);

/**
 * Homepage background — sticky viewport WebGL scene for hero, categories, and trending.
 */
export function HomePageBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-none -translate-x-1/2"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#080810] to-[#050508]" />
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <HomeShowcaseScene />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 95% 60% at 50% 30%, transparent 0%, rgba(3,3,8,0.4) 45%, rgba(3,3,8,0.92) 100%)',
        }}
      />
      {/* CRT scanlines + subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />
    </div>
  );
}
