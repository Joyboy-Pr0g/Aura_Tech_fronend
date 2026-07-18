import { getAdminQuestionsServer } from '@/features/admin/services/admin-questions-server';
import { AdminQuestionsPanel } from '@/features/admin/components/questions/admin-questions-panel';

const PAGE_SIZE = 20;

interface AdminQuestionsContentProps {
  searchParams: Promise<{ search?: string }>;
}

export async function AdminQuestionsContent({ searchParams }: AdminQuestionsContentProps) {
  const params = await searchParams;

  const page = await getAdminQuestionsServer({
    search: params.search?.trim() || undefined,
    limit: PAGE_SIZE,
  });

  return (
    <AdminQuestionsPanel
      initial={page}
      initialSearch={params.search}
    />
  );
}
