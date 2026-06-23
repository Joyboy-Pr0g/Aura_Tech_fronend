import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SearchBar } from '@/features/home/components/search-bar';
import { MOCK_PRODUCTS } from '@/lib/mock/data';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

interface ProductsPageProps {
  searchParams: Promise<{
    search_query?: string;
    category_id?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.search_query?.toLowerCase() ?? '';
  const category = params.category_id?.toLowerCase() ?? '';

  let products = MOCK_PRODUCTS;

  if (query) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
  }

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase().includes(category) || category.includes(p.category.toLowerCase()),
    );
  }

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mb-10 space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">Catalog</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Products</h1>
            <p className="text-white/50 mt-2">
              {products.length} product{products.length !== 1 ? 's' : ''} found
              {query && ` for "${params.search_query}"`}
            </p>
          </div>
          <SearchBar defaultValue={params.search_query ?? ''} className="max-w-xl" />
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-white/50">No products match your search. Try a different query.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="group overflow-hidden h-full transition-all hover:border-primary-500/30">
                  <div className="aspect-square overflow-hidden bg-dark-800">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-white/40">{product.brand} · {product.category}</p>
                    <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-primary-400">{formatCurrency(product.price)}</span>
                      <Badge variant={product.inStock ? 'success' : 'danger'}>
                        {product.inStock ? 'In stock' : 'Out of stock'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
