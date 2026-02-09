import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

interface BestSellersProps {
  products: Product[];
  loading?: boolean;
}

export function BestSellers({ products, loading }: BestSellersProps) {
  if (loading) {
    return (
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="h-6 w-48 bg-muted rounded-sm animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-sm" />
                <div className="mt-2 h-4 bg-muted rounded-sm w-3/4" />
                <div className="mt-1 h-3 bg-muted rounded-sm w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-destructive/30 rounded-sm bg-destructive/5">
              <TrendingUp className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                Best Sellers
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                // top rated by users
              </p>
            </div>
          </div>
          <Link
            to="/products?bestseller=true"
            className="text-primary hover:text-primary/80 flex items-center gap-1 font-mono text-xs tracking-wider"
          >
            --trending
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
