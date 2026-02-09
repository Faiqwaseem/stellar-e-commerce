import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
    gradient: 'from-primary/90 to-secondary/90',
  },
  {
    id: 2,
    title: 'New Fashion Collection',
    subtitle: 'Summer 2024 Arrivals',
    description: 'Discover the latest trends in fashion and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=800&fit=crop',
    cta: 'Shop Fashion',
    href: '/products?category=Fashion',
    gradient: 'from-purple-600/90 to-pink-600/90',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Transform Your Space',
    description: 'Premium furniture and decor for modern living',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=800&fit=crop',
    cta: 'Shop Home & Living',
    href: '/products?category=Home & Living',
    gradient: 'from-emerald-600/90 to-teal-600/90',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="max-w-2xl text-white"
                    >
                      <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full">
                        {slide.subtitle}
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white/90 mb-6">
                        {slide.description}
                      </p>
                      <Link to={slide.href}>
                        <Button
                          size="lg"
                          className="bg-white text-foreground hover:bg-white/90 group"
                        >
                          {slide.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
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
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
