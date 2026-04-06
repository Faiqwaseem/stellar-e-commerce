import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function Returns() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Return & <span className="text-primary">Refund</span> Policy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            We want you to be completely satisfied with your purchase.
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24 max-w-3xl mx-auto space-y-8">
        {/* Return Window */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><RotateCcw className="h-5 w-5 text-primary" /></div>
            <h2 className="font-display text-lg font-bold">Return Conditions</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Items can be returned within <strong className="text-foreground">7 days</strong> of delivery.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Products must be unused, unworn, and in original packaging with tags attached.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Include the original receipt or proof of purchase.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Items must not be damaged by the customer.</li>
          </ul>
        </motion.div>

        {/* Non-Returnable */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-destructive" /></div>
            <h2 className="font-display text-lg font-bold">Non-Returnable Items</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {['Perishable goods (food, flowers)', 'Intimate or sanitary products', 'Customized or personalized items', 'Items marked as "Final Sale"', 'Digital products or gift cards', 'Items without original packaging or tags'].map(item => (
              <li key={item} className="flex items-start gap-2"><XCircle className="h-4 w-4 text-destructive/60 mt-0.5 shrink-0" /> {item}</li>
            ))}
          </ul>
        </motion.div>

        {/* Refund Process */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
            <h2 className="font-display text-lg font-bold">Refund Process</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Contact support with your order number and reason for return.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Ship the item back using the provided return label or drop-off location.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Once received and inspected, your refund will be processed within <strong className="text-foreground">5-7 business days</strong>.</span>
            </div>
          </div>
        </motion.div>

        <div className="text-center pt-4">
          <a href="/contact" className="inline-flex items-center text-primary font-semibold hover:underline">
            Need help with a return? Contact us <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      </section>
    </div>
  );
}
