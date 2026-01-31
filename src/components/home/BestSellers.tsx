import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Flame } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

interface BestSellersProps {
  products: Product[];
  loading?: boolean;
}

export function BestSellers({ products, loading }: BestSellersProps) {
  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="mt-2 h-4 bg-muted rounded w-3/4" />
                <div className="mt-1 h-3 bg-muted rounded w-1/2" />
                <div className="mt-2 h-5 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-2 rounded-full bg-destructive/10"
            >
              <Flame className="h-6 w-6 text-destructive" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-display font-bold"
              >
                Best Sellers
              </motion.h2>
              <p className="text-muted-foreground mt-1">
                Top-rated products loved by customers
              </p>
            </div>
          </div>
          <Link
            to="/products?bestseller=true"
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
