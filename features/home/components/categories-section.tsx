import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_CATEGORIES } from '@/lib/mock/data';
import { cn } from '@/lib/utils/cn';

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-20">
      <Container>
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="secondary" className="mb-3">Categories</Badge>
            <h2 className="text-3xl font-bold text-white">Browse by category</h2>
            <p className="text-white/50 mt-2">Find exactly what you need, faster.</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CATEGORIES.map((category) => (
            <Link key={category.id} href={`/products?category_id=${category.slug}`}>
              <Card className={cn(
                'group p-6 h-full transition-all duration-300',
                'hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5',
              )}>
                <div className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl mb-4',
                  'bg-gradient-to-br border border-white/5',
                  category.gradient,
                )}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-white/50 mt-1 line-clamp-2">{category.description}</p>
                <p className="text-xs text-white/30 mt-3">{category.productCount} products</p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
