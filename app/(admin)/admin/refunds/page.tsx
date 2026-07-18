import { AdminRefundsContent } from '@/features/admin/components/refunds/admin-refunds-content';

interface AdminRefundsPageProps {
  searchParams?: Promise<{
    status?: string;
    order_number?: string;
  }>;
}

export default async function AdminRefundsPage({ searchParams }: AdminRefundsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  return <AdminRefundsContent searchParams={params} />;
}
