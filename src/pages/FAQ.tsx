import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SEO } from '@/components/SEO';

const faqCategories = [
  {
    title: 'Orders & Payments',
    items: [
      { q: 'How do I place an order?', a: 'Simply browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details and select your preferred payment method to complete the order.' },
      { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD), JazzCash, and Easypaisa. More payment options are being added soon.' },
      { q: 'Can I cancel or modify my order?', a: 'You can cancel or modify your order within 1 hour of placing it by contacting our support team. Once the order is being processed, modifications may not be possible.' },
      { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking number via email/SMS. You can also track your orders from the "My Orders" section in your account.' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days for major cities and 5-7 business days for other areas across Pakistan.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders above PKR 3,000. Orders below this amount have a flat shipping fee of PKR 200.' },
      { q: 'Do you deliver internationally?', a: 'Currently, we only deliver within Pakistan. International shipping will be available soon.' },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return policy for most products. Items must be unused, in original packaging, and with tags attached.' },
      { q: 'How do I request a refund?', a: 'Contact our support team with your order number and reason for return. Once approved, you\'ll receive a refund within 5-7 business days.' },
      { q: 'Are there items that cannot be returned?', a: 'Perishable goods, intimate apparel, customized products, and items marked as "Final Sale" cannot be returned.' },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" at the top of the page and fill in your details. You can also sign up during checkout.' },
      { q: 'Is my personal information safe?', a: 'Absolutely. We use industry-standard encryption and security practices to protect your data. Read our Privacy Policy for more details.' },
      { q: 'I forgot my password. What should I do?', a: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a link to reset your password.' },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen">
      <SEO title="FAQ" description="Find answers to frequently asked questions about MyStore Pakistan — orders, shipping, returns, payments, and more." />
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" /> FAQ
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find quick answers to common questions about shopping with MyStore.
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24 max-w-3xl mx-auto">
        {faqCategories.map((cat, ci) => (
          <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }} className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 text-primary">{cat.title}</h2>
            <Accordion type="single" collapsible className="bg-card border rounded-2xl overflow-hidden">
              {cat.items.map((item, i) => (
                <AccordionItem key={i} value={`${ci}-${i}`} className="border-b last:border-b-0 px-6">
                  <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ))}

        <div className="text-center bg-card border rounded-2xl p-8 mt-8">
          <p className="text-muted-foreground mb-3">Still have questions?</p>
          <a href="/contact" className="text-primary font-semibold hover:underline">Contact our support team →</a>
        </div>
      </section>
    </div>
  );
}
