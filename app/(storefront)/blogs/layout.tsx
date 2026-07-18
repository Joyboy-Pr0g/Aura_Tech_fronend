import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Blog',
    description: 'Tech news, buying guides, and tips from AURA TECH.',
    path: '/blogs',
  });
}

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
