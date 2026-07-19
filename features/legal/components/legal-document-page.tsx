'use client';

import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getLegalDocument } from '@/features/legal/content';
import type { LegalDocumentId } from '@/features/legal/types';

interface LegalDocumentPageProps {
  documentId: LegalDocumentId;
}

export function LegalDocumentPage({ documentId }: LegalDocumentPageProps) {
  const { locale, t } = useLocale();
  const doc = getLegalDocument(documentId, locale);

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="secondary" className="mb-3">
            {t('legal.badge')}
          </Badge>
          <h1 className="text-3xl font-bold text-white lg:text-4xl">{doc.title}</h1>
          <p className="mt-2 text-sm text-white/40">
            {t('legal.lastUpdated')}: {doc.lastUpdated}
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/55">{doc.subtitle}</p>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/55">
            {doc.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <article className="mt-10 space-y-10">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-white lg:text-2xl">{section.title}</h2>

                {section.callout ? (
                  <Card className="mt-4 border-primary-500/30 bg-primary-500/5">
                    <CardContent className="space-y-2 p-5">
                      <p className="font-semibold text-primary-300">{section.callout.title}</p>
                      <p className="text-sm leading-relaxed text-white/70">{section.callout.body}</p>
                    </CardContent>
                  </Card>
                ) : null}

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mt-4 text-sm leading-relaxed text-white/55">
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-relaxed text-white/55">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.ordered?.length ? (
                  <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-white/55">
                    {section.ordered.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </div>
  );
}
