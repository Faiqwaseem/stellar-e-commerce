import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

const contactInfo = [
  { icon: MapPin, label: 'Address', value: '123 Shopping Street, Lahore, Pakistan' },
  { icon: Phone, label: 'Phone', value: '+92 300 1234567' },
  { icon: Mail, label: 'Email', value: 'support@mystore.pk' },
  { icon: Clock, label: 'Hours', value: 'Mon - Sat: 9AM - 9PM' },
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Message Sent!', description: 'We\'ll get back to you within 24 hours.' });
      setForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <SEO title="Contact Us" description="Get in touch with MyStore Pakistan. Reach out for support, inquiries, or feedback. We're here to help!" />
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="text-primary">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-2xl font-bold">Contact Information</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Reach out to us through any of the channels below or fill out the contact form and our team will respond promptly.
            </p>
            <div className="space-y-4 pt-2">
              {contactInfo.map(c => (
                <div key={c.label} className="flex items-start gap-4 p-4 bg-card border rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.label}</p>
                    <p className="text-muted-foreground text-sm">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 md:p-8 space-y-5">
              <h2 className="font-display text-2xl font-bold">Send Us a Message</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                {errors.message && <p className="text-destructive text-xs">{errors.message}</p>}
              </div>
              <Button type="submit" className="w-full sm:w-auto px-8" disabled={loading}>
                {loading ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
