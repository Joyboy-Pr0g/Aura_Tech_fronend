import type { LegalDocument, LegalDocumentId } from '../types';
import { privacyPolicyEn } from './privacy-policy.en';
import { privacyPolicyAr } from './privacy-policy.ar';
import { termsOfServiceEn } from './terms-of-service.en';
import { termsOfServiceAr } from './terms-of-service.ar';
import type { Locale } from '@/lib/i18n/locale-provider';

const DOCUMENTS: Record<LegalDocumentId, Record<Locale, LegalDocument>> = {
  'privacy-policy': {
    en: privacyPolicyEn,
    ar: privacyPolicyAr,
  },
  'terms-of-service': {
    en: termsOfServiceEn,
    ar: termsOfServiceAr,
  },
};

export function getLegalDocument(id: LegalDocumentId, locale: Locale): LegalDocument {
  return DOCUMENTS[id][locale] ?? DOCUMENTS[id].en;
}
