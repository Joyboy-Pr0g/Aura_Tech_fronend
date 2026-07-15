import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function PaymentsSkeleton() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-dark-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-dark p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
