import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function AddressesSkeleton() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-dark p-5 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        ))}
      </div>
    </div>
  );
}
