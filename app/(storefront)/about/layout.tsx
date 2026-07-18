import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'About',
    description: 'Learn about AURA TECH — Yemen\'s premium gaming and technology store.',
    path: '/about',
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
