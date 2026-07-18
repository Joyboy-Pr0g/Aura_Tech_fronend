import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductImage } from '@/components/ui/product-image';
import { getBlogsServer } from '@/features/blogs/services/blogs-server';
import { formatDateTime } from '@/lib/utils/format';

export default async function BlogsPage() {
  const blogs = await getBlogsServer();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mb-10">
          <Badge variant="secondary" className="mb-3">Blog</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">AURA TECH Blog</h1>
          <p className="text-white/50 mt-2">Tech news, buying guides, and tips for gamers in Yemen.</p>
        </div>

        {blogs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-white/50">No blog posts yet. Check back soon.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
                <Card className="overflow-hidden h-full transition-colors hover:border-primary-500/30">
                  <div className="relative aspect-[16/9] bg-dark-800">
                    {blog.cover_image_url ? (
                      <ProductImage
                        src={blog.cover_image_url}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-white/40">{formatDateTime(blog.published_at ?? blog.created_at)}</p>
                    <h2 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {blog.title}
                    </h2>
                    {blog.excerpt && <p className="text-sm text-white/50 line-clamp-3">{blog.excerpt}</p>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
