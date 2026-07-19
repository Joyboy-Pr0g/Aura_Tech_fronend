export type LegalDocumentId = 'privacy-policy' | 'terms-of-service';

export interface LegalCallout {
  title: string;
  body: string;
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  ordered?: string[];
  callout?: LegalCallout;
}

export interface LegalDocument {
  id: LegalDocumentId;
  locale: 'en' | 'ar';
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
}
