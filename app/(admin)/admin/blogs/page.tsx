import { Suspense } from 'react';
import { AdminBlogsContent } from '@/features/admin/components/blogs/admin-blogs-content';

export default function AdminBlogsPage() {
  return (
    <Suspense fallback={<div className="p-8 animate-pulse h-64 card-dark" />}>
      <AdminBlogsContent />
    </Suspense>
  );
}
