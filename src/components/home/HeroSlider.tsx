import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    title: 'Mega Sale is Live!',
    subtitle: 'Up to 70% Off on Electronics',
    description: 'Get the latest smartphones, laptops, and gadgets at unbeatable prices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&h=800&fit=crop',
    cta: 'Shop Electronics',
    href: '/products?category=Electronics',
    gradient: 'from-primary/95 via-primary/80 to-secondary/90',
    accent: 'bg-accent',
  },
  {
    id: 2,
    title: 'New Fashion Collection',
    subtitle: 'Summer 2024 Arrivals',
    description: 'Discover the latest trends in fashion and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=800&fit=crop',
    cta: 'Shop Fashion',
    href: '/products?category=Fashion',
    gradient: 'from-purple-600/95 via-purple-500/80 to-pink-600/90',
    accent: 'bg-pink-400',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Transform Your Space',
    description: 'Premium furniture and decor for modern living',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=800&fit=crop',
    cta: 'Shop Home & Living',
    href: '/products?category=Home & Living',
    gradient: 'from-emerald-600/95 via-emerald-500/80 to-teal-600/90',
    accent: 'bg-emerald-300',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative h-[420px] md:h-[520px] lg:h-[620px] overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {/* Background Image with Ken Burns */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.08 }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />

                {/* Gradient Overlay with mesh */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                {/* Decorative elements */}
                <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-2xl text-white"
                    >
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm font-semibold bg-white/15 backdrop-blur-md rounded-full border border-white/20"
                      >
                        <Sparkles className="h-4 w-4" />
                        {slide.subtitle}
                      </motion.span>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-5 leading-[1.05] tracking-tight">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white/85 mb-8 max-w-lg leading-relaxed">
                        {slide.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link to={slide.href}>
                          <Button
                            size="lg"
                            className="bg-white text-foreground hover:bg-white/90 group rounded-full px-8 h-13 text-base font-semibold shadow-xl"
                          >
                            {slide.cta}
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                        <Link to="/products">
                          <Button
                            size="lg"
                            variant="ghost"
                            className="text-white hover:bg-white/15 rounded-full px-8 h-13 text-base border border-white/30"
                          >
                            View All
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative h-2 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: index === currentSlide ? 40 : 10 }}
          >
            <div className="absolute inset-0 bg-white/30 rounded-full" />
            {index === currentSlide && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
