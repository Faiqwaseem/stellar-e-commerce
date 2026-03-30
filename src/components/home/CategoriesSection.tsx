import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoriesSection({ categories, loading }: CategoriesSectionProps) {
  if (loading) {
    return (
      <section className="py-14 bg-muted/30">
        <div className="container">
          <div className="h-8 w-48 bg-muted rounded-xl animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-muted rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 relative overflow-hidden">
      {/* Subtle mesh background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="container relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold"
            >
              Shop by Category
            </motion.h2>
            <p className="text-muted-foreground mt-1">Find what you're looking for</p>
          </div>
          <Link
            to="/products"
            className="text-primary hover:underline flex items-center gap-1 text-sm font-semibold"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
            >
              <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={category.image_url || '/placeholder.svg'}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
                    />
                    {/* Multi-layer gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-center text-sm md:text-base font-bold text-white tracking-wide">
                      {category.name}
                    </h3>
                    <p className="text-center text-xs text-white/60 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore →
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
