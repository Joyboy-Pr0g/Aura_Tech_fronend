import { Suspense } from 'react';
import { AdminCouponsContent } from '@/features/admin/components/coupons/admin-coupons-content';

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<div className="p-8 animate-pulse h-64 card-dark" />}>
      <AdminCouponsContent />
    </Suspense>
  );
}
