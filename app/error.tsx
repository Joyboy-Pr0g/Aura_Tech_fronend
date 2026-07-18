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
        <h2 className="text-xl font-bold text-white">حدث خطأ ما</h2>
        <p className="text-white/50 text-sm">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <button type="button" onClick={reset} className="btn-primary">
          حاول مرة أخرى
        </button>
      </div>
    </main>
  );
}
