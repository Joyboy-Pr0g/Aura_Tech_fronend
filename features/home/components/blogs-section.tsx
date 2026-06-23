import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_BLOGS } from '@/lib/mock/data';

export function BlogsSection() {
  return (
    <section className="py-16 lg:py-20 border-t border-white/5">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="secondary" className="mb-3">From the blog</Badge>
            <h2 className="text-3xl font-bold text-white">Latest insights</h2>
            <p className="text-white/50 mt-2">Guides, reviews, and tech news.</p>
          </div>
          <Link
            href="/blogs"
            className="hidden sm:flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            All articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_BLOGS.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}>
              <Card className="group overflow-hidden h-full transition-all hover:border-primary-500/30">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{blog.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-white/50 line-clamp-2">{blog.excerpt}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
