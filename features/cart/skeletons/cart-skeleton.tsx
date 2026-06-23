import { Skeleton } from '@/features/shared/components/ui/skeleton';

export function CartSkeleton() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <Skeleton className="h-8 w-32" />
      <div className="card-dark divide-y divide-white/5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="w-14 h-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="card-dark p-5 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
    </div>
  );
}
