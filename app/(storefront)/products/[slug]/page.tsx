import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { getProductBySlugServer } from '@/features/products/services/products-server';
import { getSession } from '@/lib/auth/session';
import { ProductDetailClient } from '@/features/products/components/product-detail-client';
import { ProductDetailNav } from '@/features/products/components/product-detail-nav';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getProductImageUrl } from '@/lib/products/helpers';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) return { title: 'Product not found' };

  return getPageMetadataFromSettings({
    title: product.title,
    description: product.description?.slice(0, 160) ?? `${product.title} — ${product.brand}`,
    path: `/products/${product.slug}`,
    image: getProductImageUrl(product),
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    getProductBySlugServer(slug),
    getSession(),
  ]);

  if (!product) notFound();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <ProductDetailNav
          productTitle={product.title}
          productSlug={product.slug}
          category={
            product.category
              ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
              : undefined
          }
          subCategory={
            product.sub_category
              ? { name: product.sub_category.name, slug: product.sub_category.slug }
              : undefined
          }
        />
        <ProductDetailClient product={product} isAuthenticated={!!session} />
      </Container>
    </div>
  );
}
