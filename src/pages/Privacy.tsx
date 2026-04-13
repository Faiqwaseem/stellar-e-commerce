import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Shield, Database, Cookie, Eye, Lock, Bell } from 'lucide-react';

const sections = [
  { icon: Database, title: 'Information We Collect', content: `We collect information you provide directly:\n\n• Personal details (name, email, phone number)\n• Shipping and billing addresses\n• Payment information (processed securely; we never store card details)\n• Account credentials\n• Order history and preferences\n\nWe also automatically collect:\n• Device information and browser type\n• IP address and approximate location\n• Browsing behavior on our website\n• Cookies and similar tracking technologies` },
  { icon: Eye, title: 'How We Use Your Information', content: `Your information is used to:\n\n• Process and fulfill your orders\n• Communicate about orders, deliveries, and returns\n• Provide customer support\n• Personalize your shopping experience\n• Send promotional offers (with your consent)\n• Improve our website and services\n• Prevent fraud and ensure security` },
  { icon: Shield, title: 'How We Protect Your Data', content: `We implement industry-standard security measures:\n\n• SSL/TLS encryption for all data transmission\n• Secure payment processing through trusted gateways\n• Regular security audits and vulnerability assessments\n• Access controls and employee data handling policies\n• Encrypted storage of sensitive information` },
  { icon: Cookie, title: 'Cookies & Tracking', content: `We use cookies to:\n\n• Keep you logged in to your account\n• Remember items in your shopping cart\n• Analyze website traffic and usage patterns\n• Personalize content and recommendations\n\nYou can control cookies through your browser settings. Disabling cookies may affect some website functionality.` },
  { icon: Lock, title: 'Data Sharing', content: `We do not sell your personal data. We may share information with:\n\n• Delivery partners (for order fulfillment)\n• Payment processors (for transaction processing)\n• Analytics providers (anonymized data only)\n• Law enforcement (when legally required)\n\nAll third parties are bound by data protection agreements.` },
  { icon: Bell, title: 'Your Rights', content: `You have the right to:\n\n• Access your personal data\n• Correct inaccurate information\n• Request deletion of your data\n• Opt out of marketing communications\n• Export your data\n\nTo exercise these rights, contact us at privacy@mystore.pk.` },
];

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <SEO title="Privacy Policy" description="Read MyStore Pakistan's privacy policy. Learn how we collect, use, and protect your personal information." />
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Privacy <span className="text-primary">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Your privacy matters to us. Here's how we handle your data.
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
