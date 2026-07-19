'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Category } from '@/lib/types/entities';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { ProductImage } from '@/components/ui/product-image';
import { Button } from '@/components/ui/button';
import { buildCategoryProductsPath } from '@/lib/storefront/product-paths';

interface CategoriesSliderProps {
  categories: Category[];
}

export function CategoriesSlider({ categories }: CategoriesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <section id="shop-by-category" className="py-16 lg:py-20">
      <Container>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant='secondary' className='mb-3'>{t('home.categoriesBadge')}</Badge>
            <h2 className='text-3xl font-bold text-white'>{t('home.categories')}</h2>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => scroll('left')}
              aria-label={t('common.previous')}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={() => scroll('right')}
              aria-label={t('common.next')}
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>

        </div>

        <div
          ref={scrollRef}
          className='flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide'
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((category) => (
            <Link key={category.id}
              href={buildCategoryProductsPath(category.slug, null)}
              className='snap-start shrink-0 w-[200px] sm:w-[220px]'
            >
              <Card className={cn(
                'group h-full overflow-hidden transition-all duration-300',
                'hover:border-primary-500/40 hover:shadow-lg hover:shadow-primary-500/10 hover:scale-[1.02]',
              )}>
                <div className="relative aspect-[4/3] bg-dark-800 flex items-center justify-center overflow-hidden">
                  {category.image_url ? (
                    <ProductImage
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Layers className="h-10 w-10 text-primary-400/40" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Card>

            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
