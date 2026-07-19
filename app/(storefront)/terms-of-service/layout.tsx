import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Terms of Service',
    description:
      'Read AURA TECH terms for orders, manual bank transfer payments, refunds, shipping, and account use.',
    path: '/terms-of-service',
  });
}

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
