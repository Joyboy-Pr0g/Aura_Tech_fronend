import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { MOCK_PRODUCTS } from '@/lib/mock/data';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowLeft } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) notFound();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="aspect-square rounded-2xl overflow-hidden bg-dark-800 border border-white/10">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">{product.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.title}</h1>
              <p className="text-white/50 mt-2">{product.brand}</p>
            </div>

            <p className="text-3xl font-bold text-primary-400">{formatCurrency(product.price)}</p>

            <Badge variant={product.inStock ? 'success' : 'danger'} className="text-sm px-3 py-1">
              {product.inStock ? 'In stock — ready to ship' : 'Currently unavailable'}
            </Badge>

            <p className="text-white/50 leading-relaxed">
              Premium {product.category.toLowerCase()} from {product.brand}. Full specifications and live inventory will connect to the backend API in production.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <ButtonLink href="/login" className="flex-1 sm:flex-none">
                Sign in to purchase
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" className="flex-1 sm:flex-none">
                Continue shopping
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
