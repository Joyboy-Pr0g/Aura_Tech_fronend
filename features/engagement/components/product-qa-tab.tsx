'use client';

import { FormEvent, useEffect, useState } from 'react';
import { askQuestion, getProductQuestions } from '@/features/engagement/services/engagement-client';
import { ProductQuestion } from '@/features/engagement/types';
import { useLocale } from '@/lib/i18n/locale-provider';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toaster';

interface ProductQaTabProps {
  productId: string;
  isAuthenticated: boolean;
}

export function ProductQaTab({ productId, isAuthenticated }: ProductQaTabProps) {
  const { t } = useLocale();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getProductQuestions(productId)
      .then((data) => setQuestions(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast(t('qa.signIn'), 'info');
      return;
    }
    if (question.trim().length < 5) return;

    setSubmitting(true);
    try {
      await askQuestion(productId, question.trim());
      setQuestion('');
      toast(t('qa.submitted'), 'success');
      load();
    } catch {
      toast(t('qa.error'), 'error');
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

      {loading ? (
        <p className="text-white/40 text-sm">{t('common.loading')}</p>
      ) : questions.length === 0 ? (
        <p className="text-white/40 text-sm">{t('qa.none')}</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="card-dark p-4 space-y-3">
              <div>
                <p className="text-white font-medium">{q.question}</p>
                <p className="text-xs text-white/40 mt-1">
                  {q.customer?.full_name ?? t('reviews.anonymous')} ·{' '}
                  {new Date(q.created_at).toLocaleDateString()}
                </p>
              </div>
              {q.answers.length > 0 ? (
                <div className="border-s-2 border-primary-500/30 ps-4 space-y-2">
                  {q.answers.map((a) => (
                    <div key={a.id}>
                      <p className="text-sm text-white/70">{a.answer}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {a.answered_by?.full_name ?? t('qa.staff')}
                        {a.is_seller_answer && ` · ${t('qa.seller')}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40">{t('qa.awaiting')}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
