import { Suspense } from 'react';
import { AdminQuestionsContent } from '@/features/admin/components/questions/admin-questions-content';
import { AdminTableSkeleton } from '@/features/admin/skeletons/admin-table-skeleton';

interface AdminQuestionsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminQuestionsContent searchParams={searchParams} />
    </Suspense>
  );
}
