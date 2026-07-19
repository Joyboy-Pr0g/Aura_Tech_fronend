import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Privacy Policy',
    description:
      'Learn how AURA TECH collects, protects, and uses your personal data on auratechplus.com.',
    path: '/privacy-policy',
  });
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
