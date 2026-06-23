'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="card-dark p-8 max-w-md text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-white/50 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
      </div>
    </main>
  );
}
