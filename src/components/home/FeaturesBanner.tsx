import { motion } from 'framer-motion';
import { Truck, Shield, Headphones, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over PKR 5,000',
    color: 'from-primary/10 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% protected transactions',
    color: 'from-success/10 to-success/5',
    iconColor: 'text-success',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service',
    color: 'from-accent/10 to-accent/5',
    iconColor: 'text-accent',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day return policy',
    color: 'from-purple-500/10 to-purple-500/5',
    iconColor: 'text-purple-500',
  },
];

export function FeaturesBanner() {
  return (
    <section className="py-6 relative">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="p-3 rounded-xl bg-background shadow-sm">
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
