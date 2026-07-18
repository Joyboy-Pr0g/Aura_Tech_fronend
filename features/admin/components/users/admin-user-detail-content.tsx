import {
  getAdminUserServer,
  getAdminUserOrdersServer,
  getAdminUserReviewsServer,
  getAdminUserQuestionsServer,
} from '@/features/admin/services/admin-users-server';
import { AdminUserDetailPanel } from '@/features/admin/components/users/admin-user-detail-panel';
import { notFound } from 'next/navigation';

interface AdminUserDetailContentProps {
  id: string;
}

export async function AdminUserDetailContent({ id }: AdminUserDetailContentProps) {
  const [user, orders, reviews, questions] = await Promise.all([
    getAdminUserServer(id),
    getAdminUserOrdersServer(id, { limit: 20 }),
    getAdminUserReviewsServer(id),
    getAdminUserQuestionsServer(id),
  ]);

  if (!user) notFound();

  return (
    <AdminUserDetailPanel
      user={user}
      orders={orders}
      reviews={reviews}
      questions={questions}
    />
  );
}
