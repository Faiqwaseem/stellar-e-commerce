import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

export function FeaturedProducts({ products, loading }: FeaturedProductsProps) {
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
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
                Featured
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                // curated picks
              </p>
            </div>
          </div>
          <Link
            to="/products?featured=true"
            className="text-primary hover:text-primary/80 flex items-center gap-1 font-mono text-xs tracking-wider"
          >
            --all
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
