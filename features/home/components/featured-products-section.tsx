import { Container } from '@/components/ui/container';
import { getTrendingProductsServer } from '@/features/products/services/products-server';
import { FeaturedProductsHeader } from '@/features/home/components/featured-products-header';
import { FeaturedProductsGrid } from '@/features/home/components/featured-products-grid';
import { Reveal } from '@/lib/motion/reveal';

export async function FeaturedProductsSection() {
  const products = await getTrendingProductsServer(12);

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 border-t border-white/5">
      <Container>
        <Reveal>
          <FeaturedProductsHeader trending />
        </Reveal>

        <FeaturedProductsGrid products={products} />
      </Container>
    </section>
  );
}
