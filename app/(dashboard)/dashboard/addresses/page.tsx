import { Suspense } from 'react';
import { AddressesContent } from '@/features/addresses/components/addresses-content';
import { AddressesSkeleton } from '@/features/addresses/skeletons/addresses-skeleton';

export default function AddressesPage() {
  return (
    <Suspense fallback={<AddressesSkeleton />}>
      <AddressesContent />
    </Suspense>
  );
}
