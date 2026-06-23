import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function OrderDetailSkeleton() {
  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="card-dark p-5">
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="card-dark p-5 space-y-4">
        <Skeleton className="h-5 w-16" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
        <Skeleton className="h-6 w-full mt-4" />
      </div>
    </div>
  );
}
