import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function ProductGridSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-dark p-4 space-y-3">
            <Skeleton className="w-full h-36 rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
