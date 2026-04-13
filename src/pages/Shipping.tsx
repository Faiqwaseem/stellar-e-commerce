import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Truck, Clock, Globe, Package, MapPin, AlertCircle } from 'lucide-react';

const sections = [
  {
    icon: Clock, title: 'Processing Time',
    content: 'All orders are processed within 1-2 business days after payment confirmation. Orders placed on weekends or holidays will be processed the next business day.',
  },
  {
    icon: Truck, title: 'Domestic Shipping (Pakistan)',
    content: `We deliver across all major cities and towns in Pakistan.\n\n• Major Cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad): 2-3 business days\n• Other Cities: 3-5 business days\n• Remote Areas: 5-7 business days\n\nShipping Charges:\n• Orders above PKR 3,000: FREE shipping\n• Orders below PKR 3,000: Flat rate of PKR 200`,
  },
  {
    icon: Globe, title: 'International Shipping',
    content: 'International shipping is currently not available. We are working to expand our delivery network globally. Stay tuned for updates!',
  },
  {
    icon: Package, title: 'Order Tracking',
    content: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from the "My Orders" section in your account dashboard.',
  },
  {
    icon: MapPin, title: 'Delivery Attempts',
    content: 'Our courier partner will attempt delivery up to 3 times. If delivery is unsuccessful after 3 attempts, the order will be returned to our warehouse and a refund will be processed.',
  },
  {
    icon: AlertCircle, title: 'Important Notes',
    content: '• Delivery times are estimates and may vary during peak seasons or due to unforeseen circumstances.\n• Please ensure your shipping address and phone number are correct to avoid delays.\n• Someone must be available at the delivery address to receive the package.\n• We are not responsible for delays caused by courier services or customs.',
  },
];

export default function Shipping() {
  return (
    <div className="min-h-screen">
      <SEO title="Shipping Policy" description="Learn about MyStore Pakistan's shipping policy — delivery times, charges, tracking, and more." />
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shipping <span className="text-primary">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know about how we deliver your orders.
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24 max-w-3xl mx-auto space-y-6">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold">{s.title}</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
