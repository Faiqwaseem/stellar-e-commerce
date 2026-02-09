import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { ChevronRight, Folder } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoriesSection({ categories, loading }: CategoriesSectionProps) {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="h-6 w-48 bg-muted rounded-sm animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Folder className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">
              Categories
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
              {categories.length} dirs
            </span>
          </div>
          <Link
            to="/products"
            className="text-primary hover:text-primary/80 flex items-center gap-1 font-mono text-xs tracking-wider"
          >
            ls -la
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                <div className="group relative overflow-hidden rounded-sm bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-glow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image_url || '/placeholder.svg'}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-75 group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-mono text-[10px] text-primary mb-0.5">./</p>
                    <h3 className="text-sm font-semibold text-foreground">
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
