import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_BLOGS } from '@/lib/mock/data';
import { Clock } from 'lucide-react';

export default function BlogsPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mb-10">
          <Badge variant="secondary" className="mb-3">Blog</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Insights & Guides</h1>
          <p className="text-white/50 mt-2">Tech news, reviews, and tutorials from the AURA TECH team.</p>
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
                  <h2 className="font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-white/50 line-clamp-3">{blog.excerpt}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
