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
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-xl" />
                <div className="mt-2 h-4 bg-muted rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold">
            Shop by Category
          </h2>
          <Link
            to="/products"
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                <div className="group relative overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={category.image_url || '/placeholder.svg'}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-center text-sm md:text-base font-semibold text-white">
                      {category.name}
                    </h3>
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
