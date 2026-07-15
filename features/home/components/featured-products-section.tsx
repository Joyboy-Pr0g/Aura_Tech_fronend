import { Container } from '@/components/ui/container';
import { getProductsServer } from '@/features/products/services/products-server';
import { ProductCard } from '@/features/products/components/product-card';
import { FeaturedProductsHeader } from '@/features/home/components/featured-products-header';

export async function FeaturedProductsSection() {
  const { items: products } = await getProductsServer({ limit: 12 });

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 border-t border-white/5">
      <Container>
        <FeaturedProductsHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
