import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Percent, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    tag: 'SALE.exe',
    title: 'Beauty\nCollection',
    subtitle: 'Up to 50% Off',
    href: '/products?category=Beauty',
    icon: Percent,
    accent: 'primary',
  },
  {
    id: 2,
    tag: 'NEW.pkg',
    title: 'Sports\nGear',
    subtitle: 'New Arrivals',
    href: '/products?category=Sports',
    icon: Package,
    accent: 'accent',
  },
];

export function PromoBanners() {
  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-3">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={banner.href}>
                <div className="group relative overflow-hidden rounded-sm border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow p-6 md:p-8 h-48 md:h-56 flex flex-col justify-between">
                  {/* Background pattern */}
                  <div className="absolute inset-0 dot-pattern opacity-30" />
                  
                  {/* Large faded icon */}
                  <banner.icon className="absolute right-4 bottom-4 h-24 w-24 text-primary/5" />

                  <div className="relative z-10">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                      {banner.tag}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight mt-3 whitespace-pre-line text-foreground">
                      {banner.title}
                    </h3>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {banner.subtitle}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-mono text-xs text-primary hover:text-primary group-hover:translate-x-1 transition-transform"
                    >
                      cd ./shop
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
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
