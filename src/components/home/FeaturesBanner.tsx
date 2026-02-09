import { motion } from 'framer-motion';
import { Truck, Shield, Headphones, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'FREE_SHIPPING',
    description: 'Orders > PKR 5,000',
    code: '--free-tier',
  },
  {
    icon: Shield,
    title: 'SECURE_PAY',
    description: '256-bit encryption',
    code: '--ssl-cert',
  },
  {
    icon: Headphones,
    title: '24/7_SUPPORT',
    description: 'Always online',
    code: '--uptime-99',
  },
  {
    icon: RefreshCw,
    title: 'EASY_RETURN',
    description: '7-day policy',
    code: '--rollback',
  },
];

export function FeaturesBanner() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="flex items-center gap-3 py-5 px-4 border-r border-border last:border-r-0"
            >
              <div className="p-2 border border-primary/30 rounded-sm bg-primary/5">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold text-foreground tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
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
