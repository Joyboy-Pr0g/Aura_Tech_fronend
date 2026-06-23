import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function AdminTableSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card-dark p-5 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
