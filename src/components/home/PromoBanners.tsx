import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Beauty Sale',
    subtitle: 'Up to 50% Off',
    description: 'Premium skincare & cosmetics',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    href: '/products?category=Beauty',
    gradient: 'from-rose-500/95 via-pink-500/90 to-fuchsia-600/90',
    icon: Zap,
  },
  {
    id: 2,
    title: 'Sports Gear',
    subtitle: 'New Arrivals',
    description: 'Professional equipment & apparel',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=400&fit=crop',
    href: '/products?category=Sports',
    gradient: 'from-blue-500/95 via-indigo-500/90 to-violet-600/90',
    icon: TrendingUp,
  },
];

export function PromoBanners() {
  return (
    <section className="py-10">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: index === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={banner.href}>
                <div className="relative h-52 md:h-60 rounded-2xl overflow-hidden group cursor-pointer">
                  {/* Background Image */}
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />

                  {/* Decorative blur circle */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center p-8 md:p-10">
                    <div className="text-white">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 border border-white/20">
                        <banner.icon className="h-3.5 w-3.5" />
                        {banner.subtitle}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold mb-1.5">
                        {banner.title}
                      </h3>
                      <p className="text-sm text-white/70 mb-5">{banner.description}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="group/btn rounded-full px-5"
                      >
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
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
