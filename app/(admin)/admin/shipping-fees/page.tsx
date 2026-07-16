import { Suspense } from 'react';
import { AdminShippingFeesContent } from '@/features/admin/components/shipping-fees/admin-shipping-fees-content';

function ShippingFeesFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-dark h-36" />
        ))}
      </div>
    </div>
  );
}

export default function AdminShippingFeesPage() {
  return (
    <Suspense fallback={<ShippingFeesFallback />}>
      <AdminShippingFeesContent />
    </Suspense>
  );
}
