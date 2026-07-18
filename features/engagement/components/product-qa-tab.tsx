'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { askQuestion } from '@/features/engagement/services/engagement-client';
import { ProductQuestionSummary } from '@/lib/types/entities';
import { ItemCarousel } from '@/components/ui/item-carousel';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toaster';

interface ProductQaTabProps {
  productId: string;
  isAuthenticated: boolean;
  questions?: ProductQuestionSummary[];
}

function QuestionCard({ question }: { question: ProductQuestionSummary }) {
  const { t } = useLocale();

  return (
    <article className="card-dark p-4 space-y-3">
      <div>
        <p className="text-white font-medium">{question.question}</p>
        <p className="text-xs text-white/40 mt-1">
          {question.customer?.full_name ?? t('reviews.anonymous')} ·{' '}
          {new Date(question.created_at).toLocaleDateString()}
        </p>
      </div>
      {question.answers.length > 0 ? (
        <div className="border-s-2 border-primary-500/30 ps-4 space-y-2">
          {question.answers.map((answer) => (
            <div key={answer.id}>
              <p className="text-sm text-white/70">{answer.answer}</p>
              <p className="text-xs text-white/40 mt-1">
                {answer.answered_by?.full_name ?? t('qa.staff')}
                {answer.is_seller_answer && ` · ${t('qa.seller')}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/40">{t('qa.awaiting')}</p>
      )}
    </article>
  );
}

export function ProductQaTab({
  productId,
  isAuthenticated,
  questions = [],
}: ProductQaTabProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast(t('qa.signIn'), 'info');
      return;
    }
    if (question.trim().length < 5) return;

    setSubmitting(true);
    try {
      const result = await askQuestion(productId, question.trim());
      setQuestion('');
      toast(
        result.is_published === false
          ? t('qa.submittedModeration')
          : t('qa.submitted'),
        result.is_published === false ? 'info' : 'success',
      );
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('qa.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="label-dark">{t('qa.ask')}</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="input-dark w-full resize-none"
          placeholder={t('qa.placeholder')}
          disabled={!isAuthenticated}
        />
        <Button type="submit" size="sm" disabled={submitting || !question.trim()}>
          {submitting ? t('common.loading') : t('qa.submit')}
        </Button>
        {!isAuthenticated && (
          <p className="text-xs text-white/40">{t('qa.signInHint')}</p>
        )}
      </form>

      <ItemCarousel
        items={questions}
        emptyMessage={t('qa.none')}
        renderItem={(item) => <QuestionCard question={item} />}
      />
    </div>
  );
}
