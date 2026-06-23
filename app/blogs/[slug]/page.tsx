import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { MOCK_BLOGS } from '@/lib/mock/data';
import { Clock, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = MOCK_BLOGS.find((b) => b.slug === slug);

  if (!blog) notFound();

  return (
    <article className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{blog.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-white/40">
              <Clock className="h-3.5 w-3.5" />
              {blog.readTime}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{blog.title}</h1>

          <div className="aspect-[16/9] rounded-2xl overflow-hidden">
            <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
          </div>

          <Card>
            <CardContent className="p-8 prose prose-invert max-w-none">
              <p className="text-lg text-white/70 leading-relaxed">{blog.excerpt}</p>
              <p className="text-white/50 mt-6 leading-relaxed">
                This is placeholder content for the full article. In production, blog posts will be loaded from the CMS or API with rich formatting, images, and embedded media.
              </p>
              <p className="text-white/50 mt-4 leading-relaxed">
                AURA TECH brings you the latest in technology news, product reviews, and buying guides tailored for the Yemeni market.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </article>
  );
}
