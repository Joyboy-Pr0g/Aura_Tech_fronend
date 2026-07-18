import type { Metadata } from 'next';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Contact',
    description: 'Contact AURA TECH for orders, support, and inquiries.',
    path: '/contact',
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
