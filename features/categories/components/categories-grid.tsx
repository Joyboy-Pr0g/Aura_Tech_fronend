import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Category } from '@/lib/types/entities';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { CategoryCard } from '@/features/categories/components/category-card';

interface CategoriesGridProps {
  categories: Category[];
  parentSlug?: string;
  parentName?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  showBackLink?: boolean;
}

export function CategoriesGrid({
  categories,
  parentSlug,
  parentName,
  title,
  subtitle,
  badge,
  showBackLink,
}: CategoriesGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="py-10 lg:py-14">
      <Container>
        {showBackLink ? (
          <Link
            href="/categories"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {parentName}
          </Link>
        ) : null}

        <div className="mb-10 max-w-3xl">
          {badge ? <Badge variant="secondary" className="mb-3">{badge}</Badge> : null}
          <h1 className="text-3xl font-bold text-white lg:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-white/50">{subtitle}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              parentSlug={parentSlug}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
