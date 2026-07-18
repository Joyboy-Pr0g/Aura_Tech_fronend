import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ProductImage } from '@/components/ui/product-image';
import { getBlogBySlugServer } from '@/features/blogs/services/blogs-server';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { formatDateTime } from '@/lib/utils/format';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlugServer(slug);
  if (!blog) return { title: 'Blog post not found' };

  return getPageMetadataFromSettings({
    title: blog.meta_title?.trim() || blog.title,
    description: blog.meta_description?.trim() || blog.excerpt || blog.content.slice(0, 160),
    path: `/blogs/${blog.slug}`,
    image: blog.cover_image_url,
    type: 'article',
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlugServer(slug);
  if (!blog) notFound();

  return (
    <div className="py-10 lg:py-14">
      <Container className="max-w-4xl">
        <Link href="/blogs" className="text-sm text-primary-400 hover:text-primary-300">
          ← Back to blog
        </Link>
        <article className="mt-6 space-y-6">
          {blog.cover_image_url && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-dark-800">
              <ProductImage src={blog.cover_image_url} alt={blog.title} fill sizes="896px" className="object-cover" />
            </div>
          )}
          <div>
            <p className="text-sm text-white/40">{formatDateTime(blog.published_at ?? blog.created_at)}</p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-white">{blog.title}</h1>
            {blog.excerpt && <p className="mt-3 text-lg text-white/60">{blog.excerpt}</p>}
          </div>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-white/80 leading-7">
            {blog.content}
          </div>
        </article>
      </Container>
    </div>
  );
}
