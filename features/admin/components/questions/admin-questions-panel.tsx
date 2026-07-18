'use client';

import { FormEvent, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HelpCircle, Search } from 'lucide-react';
import { CursorPage } from '@/lib/types/api';
import { AdminProductQuestion } from '@/features/admin/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { toast } from '@/components/ui/Toaster';
import {
  answerAdminQuestion,
  getAdminQuestions,
} from '@/features/admin/services/admin-questions-client';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/models/modal';

const PAGE_SIZE = 20;

interface AdminQuestionsPanelProps {
  initial: CursorPage<AdminProductQuestion>;
  initialSearch?: string;
}

export function AdminQuestionsPanel({ initial, initialSearch }: AdminQuestionsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [questions, setQuestions] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [answerTarget, setAnswerTarget] = useState<AdminProductQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQuestions(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }, [initial]);

  const applyFilters = useCallback(
    (search: string) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters(debouncedSearch);
  }, [debouncedSearch, applyFilters]);

  const refreshList = useCallback(() => {
    startTransition(async () => {
      const page = await getAdminQuestions({
        search: debouncedSearch.trim() || undefined,
        limit: PAGE_SIZE,
      });
      setQuestions(page.items);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
      router.refresh();
    });
  }, [debouncedSearch, router]);

  const loadMore = () => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      const page = await getAdminQuestions({
        search: debouncedSearch.trim() || undefined,
        limit: PAGE_SIZE,
        cursor: nextCursor,
      });
      setQuestions((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const handleAnswerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!answerTarget || answerText.trim().length < 2) return;

    setSubmitting(true);
    try {
      await answerAdminQuestion(answerTarget.id, answerText.trim());
      toast(t('admin.questionAnswered'), 'success');
      setAnswerTarget(null);
      setAnswerText('');
      refreshList();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('admin.actionFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('p-4 sm:p-8 space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.questions', icon: HelpCircle, iconClassName: 'text-white/60' },
        ]}
        title={t('admin.questions')}
        countLabel={t('admin.questionsCount', { count: questions.length })}
        filters={
          <div className="relative max-w-2xl">
            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.searchQuestions')}
              className="input-dark ps-9 w-full"
            />
          </div>
        }
      />

      {questions.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <p className="text-white/50">{t('admin.noQuestions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <article key={question.id} className="card-dark p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium">{question.question}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                    {question.product && (
                      <Link href={`/products/${question.product.slug}`} className="text-primary-400 hover:underline">
                        {question.product.title}
                      </Link>
                    )}
                    {question.customer && (
                      <Link href={`/admin/users/${question.customer_id}`} className="hover:text-white/60">
                        {question.customer.full_name}
                      </Link>
                    )}
                    <span>{formatDateTime(question.created_at)}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setAnswerTarget(question)}>
                  {t('admin.answerQuestion')}
                </Button>
              </div>

              {question.answers.length > 0 ? (
                <div className="border-s-2 border-primary-500/30 ps-4 space-y-2">
                  {question.answers.map((answer) => (
                    <div key={answer.id}>
                      <p className="text-sm text-white/70">{answer.answer}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {answer.answered_by?.full_name ?? t('qa.staff')}
                        {answer.is_seller_answer && ` · ${t('qa.seller')}`}
                        {' · '}
                        {formatDateTime(answer.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40">{t('qa.awaiting')}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button type="button" onClick={loadMore} disabled={isPending} className="btn-outline">
            {t('admin.loadMore')}
          </button>
        </div>
      )}

      <Modal open={!!answerTarget} onOpenChange={(open) => !open && setAnswerTarget(null)}>
        <ModalContent size="md">
          <form onSubmit={handleAnswerSubmit}>
            <ModalHeader>
              <ModalTitle>{t('admin.answerQuestion')}</ModalTitle>
              {answerTarget?.product && (
                <p className="text-sm text-white/50">{answerTarget.product.title}</p>
              )}
            </ModalHeader>
            <ModalBody className="space-y-3">
              <p className="text-sm text-white/70">{answerTarget?.question}</p>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                className="input-dark w-full resize-none"
                placeholder={t('admin.answerPlaceholder')}
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setAnswerTarget(null)} disabled={submitting}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={submitting || answerText.trim().length < 2}>
                {submitting ? t('common.loading') : t('admin.submitAnswer')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
