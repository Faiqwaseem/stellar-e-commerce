import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Terminal, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    tag: '[ FLASH_SALE ]',
    title: 'MEGA TECH DROP',
    subtitle: 'Up to 70% Off Electronics',
    description: 'Latest smartphones, laptops & gadgets — prices you won\'t find anywhere else.',
    cta: 'Browse Electronics →',
    href: '/products?category=Electronics',
    icon: Cpu,
    stats: [
      { label: 'Products', value: '2.4K+' },
      { label: 'Avg Rating', value: '4.8★' },
      { label: 'Savings', value: '70%' },
    ],
  },
  {
    id: 2,
    tag: '[ NEW_ARRIVALS ]',
    title: 'SUMMER \'26 DROP',
    subtitle: 'Fashion Collection',
    description: 'Curated streetwear and premium fashion — fresh from the runway.',
    cta: 'Shop Fashion →',
    href: '/products?category=Fashion',
    icon: Zap,
    stats: [
      { label: 'Brands', value: '120+' },
      { label: 'New Items', value: '340' },
      { label: 'Free Ship', value: '>5K' },
    ],
  },
  {
    id: 3,
    tag: '[ ESSENTIALS ]',
    title: 'HOME UPGRADE',
    subtitle: 'Transform Your Space',
    description: 'Premium furniture & decor for the modern lifestyle.',
    cta: 'Shop Home →',
    href: '/products?category=Home & Living',
    icon: Terminal,
    stats: [
      { label: 'Categories', value: '45+' },
      { label: 'Reviews', value: '12K' },
      { label: 'Delivered', value: '48h' },
    ],
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <section className="relative min-h-[480px] md:min-h-[520px] overflow-hidden bg-background grid-pattern">
      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-0 bottom-0 w-px bg-primary/5" />
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-primary/5" />
        <div className="absolute left-[60%] top-0 bottom-0 w-px bg-primary/5" />
        <div className="absolute left-[80%] top-0 bottom-0 w-px bg-primary/5" />
      </div>

      <div className="container relative z-10 flex items-center min-h-[480px] md:min-h-[520px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="w-full py-12 md:py-16"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left — Content */}
              <div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-mono text-xs tracking-[0.3em] text-primary mb-4 block"
                >
                  {slide.tag}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-2"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-mono text-sm text-accent mb-4"
                >
                  // {slide.subtitle}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground max-w-md mb-8"
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to={slide.href}>
                    <Button
                      size="lg"
                      className="gradient-primary text-primary-foreground font-mono text-sm tracking-wider border-0 shadow-glow group"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Right — Stats Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hidden md:block"
              >
                <div className="glow-border rounded-sm bg-card/50 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-mono text-xs text-primary tracking-wider">
                      SYS.STATUS: LIVE
                    </span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {slide.stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="font-mono text-[10px] text-muted-foreground space-y-1">
                      <p><span className="text-primary">$</span> latest_deals --fetch --sort=trending</p>
                      <p><span className="text-success">✓</span> {slide.stats[0].value} results loaded</p>
                      <p className="cursor-blink"><span className="text-primary">$</span> </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary border border-border hover:border-primary/50"
          onClick={() => setCurrent((p) => (p - 1 + slides.length) % slides.length)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary border border-border hover:border-primary/50"
          onClick={() => setCurrent((p) => (p + 1) % slides.length)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="font-mono text-[10px] text-muted-foreground ml-2">
          {String(current + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}
