import { Product } from '@/lib/types/entities';
import { formatCurrency } from '@/lib/utils/format';
import { getProductImageUrl, isInStock } from '@/lib/products/helpers';
import { ProductImage } from '@/components/ui/product-image';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Products</h2>

      {products.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No products yet. Add some via the API.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const imageUrl = getProductImageUrl(p);
            const inStock = isInStock(p);
            return (
              <div key={p.id} className="card-dark p-4 space-y-3">
                {imageUrl ? (
                  <ProductImage
                    src={imageUrl}
                    alt={p.title}
                    width={400}
                    height={144}
                    className="w-full h-36 rounded-lg bg-dark-800"
                  />
                ) : (
                  <div className="w-full h-36 rounded-lg bg-dark-800 flex items-center justify-center">
                    <Package className="h-8 w-8 text-white/20" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white truncate">{p.title}</p>
                  <p className="text-xs text-white/40">{p.brand} · {p.category?.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-400">{formatCurrency(p.price)}</span>
                  <span className={`text-xs ${inStock ? 'text-success' : 'text-danger'}`}>
                    {inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
