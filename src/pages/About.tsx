import { motion } from 'framer-motion';
import { Heart, Target, Eye, ShieldCheck, Truck, Headphones, Award } from 'lucide-react';
import { SEO } from '@/components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const values = [
  { icon: ShieldCheck, title: 'Trust & Quality', description: 'Every product is carefully vetted to ensure the highest quality standards for our customers.' },
  { icon: Truck, title: 'Fast Delivery', description: 'We partner with reliable couriers to deliver your orders quickly across Pakistan.' },
  { icon: Headphones, title: '24/7 Support', description: 'Our dedicated support team is always ready to help with any questions or concerns.' },
  { icon: Award, title: 'Best Prices', description: 'We negotiate directly with brands to bring you the most competitive prices.' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <SEO title="About Us" description="Learn about MyStore — Pakistan's trusted online store for electronics, fashion, and home essentials. Our mission, values, and story." />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container relative text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-semibold text-sm uppercase tracking-widest">
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold mt-3 mb-5"
          >
            About <span className="text-primary">MyStore</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Founded with a passion for making quality products accessible to everyone in Pakistan,
            MyStore has grown from a small idea into a trusted online marketplace serving thousands of happy customers.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="bg-card border rounded-2xl p-8 md:p-10"
          >
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide an exceptional online shopping experience by offering a curated selection of high-quality products
              at competitive prices, backed by outstanding customer service and fast, reliable delivery across Pakistan.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="bg-card border rounded-2xl p-8 md:p-10"
          >
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-5">
              <Eye className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become Pakistan's most trusted and loved online shopping destination, empowering local businesses
              and connecting customers with the products they need — all from the comfort of their homes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="font-display text-3xl font-bold mt-2">What Makes Us Different</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="bg-card border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="gradient-primary rounded-3xl p-10 md:p-16"
        >
          <Heart className="h-10 w-10 text-primary-foreground mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-3">Join Our Growing Family</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
            Over 10,000+ happy customers trust MyStore for their shopping needs. Experience the difference today.
          </p>
          <a href="/products" className="inline-flex items-center px-8 py-3 rounded-xl bg-background text-foreground font-semibold hover:bg-background/90 transition-colors">
            Start Shopping
          </a>
        </motion.div>
      </section>
    </div>
  );
}
