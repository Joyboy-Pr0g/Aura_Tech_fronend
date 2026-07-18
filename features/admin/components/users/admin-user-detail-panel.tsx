'use client';

import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import { Star, Users } from 'lucide-react';
import { User, Order, OrderStatus } from '@/lib/types/entities';
import { CursorPage } from '@/lib/types/api';
import { AdminProductQuestion, AdminProductReview } from '@/features/admin/types';
import { Badge } from '@/components/ui/badge';
import { TranslatedBreadcrumb } from '@/components/ui/translated-breadcrumb';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface AdminUserDetailPanelProps {
  user: User;
  orders: CursorPage<Order>;
  reviews: AdminProductReview[];
  questions: AdminProductQuestion[];
}

export function AdminUserDetailPanel({
  user,
  orders,
  reviews,
  questions,
}: AdminUserDetailPanelProps) {
  const { t } = useLocale();

  const tabs = [
    { value: 'general', label: t('admin.userTab.general') },
    { value: 'orders', label: t('admin.userTab.orders') },
    { value: 'reviews', label: t('admin.userTab.reviews') },
    { value: 'questions', label: t('admin.userTab.questions') },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <TranslatedBreadcrumb
        items={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.users', href: '/admin/users' },
          { rawLabel: user.full_name },
        ]}
      />

      <div className="flex items-center gap-3">
        <Users size={22} className="text-primary-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
          <p className="text-sm text-white/50">{user.email}</p>
        </div>
      </div>

      <Tabs.Root defaultValue="general" className="space-y-6">
        <Tabs.List className="flex flex-wrap gap-1 border-b border-white/10">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="px-4 py-2.5 text-sm font-medium text-white/50 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 -mb-px transition-colors"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="general" className="card-dark p-5 space-y-4 max-w-2xl">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-white/40">{t('admin.userName')}</dt>
              <dd className="text-white mt-1">{user.full_name}</dd>
            </div>
            <div>
              <dt className="text-white/40">{t('admin.userEmail')}</dt>
              <dd className="text-white mt-1 break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-white/40">{t('admin.userPhone')}</dt>
              <dd className="text-white mt-1">{user.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-white/40">{t('admin.userRole')}</dt>
              <dd className="text-white mt-1 capitalize">{t(`admin.role.${user.role}`)}</dd>
            </div>
            <div>
              <dt className="text-white/40">{t('admin.userStatus')}</dt>
              <dd className="mt-1">
                <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                  {user.deleted_at ? t('admin.userStatus.soft_deleted') : t(`admin.userStatus.${user.status}`)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-white/40">{t('admin.userJoined')}</dt>
              <dd className="text-white mt-1">{formatDateTime(user.created_at)}</dd>
            </div>
          </dl>
        </Tabs.Content>

        <Tabs.Content value="orders" className="space-y-3">
          {orders.items.length === 0 ? (
            <p className="text-white/40 text-sm">{t('admin.userTab.noOrders')}</p>
          ) : (
            orders.items.map((order) => (
              <div key={order.id} className="card-dark p-4 flex items-center justify-between gap-4">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-white hover:text-primary-400">
                    {order.order_number}
                  </Link>
                  <p className="text-xs text-white/40 mt-1">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="text-end space-y-1">
                  <span className={cn('text-xs font-medium', ORDER_STATUS_COLORS[order.status as OrderStatus])}>
                    {t(`orderStatus.${order.status}`)}
                  </span>
                  <p className="text-sm font-semibold text-primary-400">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))
          )}
        </Tabs.Content>

        <Tabs.Content value="reviews" className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-white/40 text-sm">{t('admin.userTab.noReviews')}</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="card-dark p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{review.title}</p>
                    {review.product && (
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="text-xs text-primary-400 hover:underline mt-0.5 inline-block"
                      >
                        {review.product.title}
                      </Link>
                    )}
                  </div>
                  {review.rating && (
                    <span className="text-warning text-sm flex items-center gap-1 shrink-0">
                      <Star size={14} className="fill-warning" />
                      {review.rating.rating}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60">{review.content}</p>
                <p className="text-xs text-white/40">{formatDateTime(review.created_at)}</p>
              </div>
            ))
          )}
        </Tabs.Content>

        <Tabs.Content value="questions" className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-white/40 text-sm">{t('admin.userTab.noQuestions')}</p>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="card-dark p-4 space-y-3">
                <div>
                  <p className="text-white font-medium">{question.question}</p>
                  {question.product && (
                    <Link
                      href={`/products/${question.product.slug}`}
                      className="text-xs text-primary-400 hover:underline mt-1 inline-block"
                    >
                      {question.product.title}
                    </Link>
                  )}
                  <p className="text-xs text-white/40 mt-1">{formatDateTime(question.created_at)}</p>
                </div>
                {question.answers.length > 0 ? (
                  <div className="border-s-2 border-primary-500/30 ps-4 space-y-2">
                    {question.answers.map((answer) => (
                      <div key={answer.id}>
                        <p className="text-sm text-white/70">{answer.answer}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {answer.answered_by?.full_name ?? t('qa.staff')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">{t('qa.awaiting')}</p>
                )}
              </div>
            ))
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
