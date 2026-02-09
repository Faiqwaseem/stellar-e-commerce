import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Beauty Sale',
    subtitle: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    href: '/products?category=Beauty',
    color: 'from-pink-500/90 to-rose-600/90',
  },
  {
    id: 2,
    title: 'Sports Gear',
    subtitle: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=400&fit=crop',
    href: '/products?category=Sports',
    color: 'from-blue-500/90 to-cyan-600/90',
  },
];

export function PromoBanners() {
  return (
    <section className="py-12">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={banner.href}>
                <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden group">
                  {/* Background Image */}
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.color}`} />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center p-6 md:p-8">
                    <div className="text-white">
                      <p className="text-sm font-medium mb-1 text-white/80">
                        {banner.subtitle}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                        {banner.title}
                      </h3>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="group/btn"
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
