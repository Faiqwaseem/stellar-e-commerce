import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { FileText, ShoppingBag, CreditCard, Scale, AlertTriangle, Gavel } from 'lucide-react';

const sections = [
  { icon: FileText, title: 'General Terms', content: `By accessing and using MyStore (mystore.pk), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.\n\nWe reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.` },
  { icon: ShoppingBag, title: 'Orders & Purchases', content: `• All orders are subject to product availability and confirmation of the order price.\n• We reserve the right to refuse or cancel any order for any reason, including suspected fraud.\n• Prices are listed in Pakistani Rupees (PKR) and are subject to change without notice.\n• Product images are for illustration purposes and may slightly differ from the actual product.\n• Once an order is placed, it constitutes an offer to purchase, which we may accept or decline.` },
  { icon: CreditCard, title: 'Payments', content: `• We accept Cash on Delivery (COD), JazzCash, and Easypaisa.\n• For COD orders, the full amount must be paid at the time of delivery.\n• Digital payments are processed securely through trusted payment gateways.\n• We do not store any credit/debit card information on our servers.` },
  { icon: Scale, title: 'Limitation of Liability', content: `• MyStore shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.\n• Our total liability for any claim shall not exceed the amount paid by you for the specific product in question.\n• We are not responsible for delays caused by courier services, natural disasters, or events beyond our control.` },
  { icon: AlertTriangle, title: 'User Responsibilities', content: `You agree to:\n\n• Provide accurate and complete information during registration and checkout.\n• Not use the website for any unlawful or fraudulent purpose.\n• Not attempt to access unauthorized areas of the website.\n• Keep your account credentials confidential.\n• Not reproduce, duplicate, or resell any part of the website without permission.` },
  { icon: Gavel, title: 'Governing Law', content: `These Terms and Conditions are governed by the laws of Pakistan. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.\n\nFor questions about these terms, contact us at legal@mystore.pk.` },
];

export default function Terms() {
  return (
    <div className="min-h-screen">
      <SEO title="Terms & Conditions" description="Read MyStore Pakistan's terms and conditions. Understand your rights and responsibilities when shopping with us." />
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Terms & <span className="text-primary">Conditions</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Please read these terms carefully before using our website.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground/60 text-sm mt-3">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24 max-w-3xl mx-auto space-y-6">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-primary" /></div>
              <h2 className="font-display text-lg font-bold">{s.title}</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
