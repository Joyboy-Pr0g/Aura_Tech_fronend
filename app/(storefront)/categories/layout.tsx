import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Categories',
    description: 'Browse all AURA TECH gaming categories — devices, accessories, and gear.',
    path: '/categories',
  });
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
