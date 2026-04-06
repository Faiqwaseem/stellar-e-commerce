import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const perks = [
  { icon: Zap, title: 'Growth Opportunities', description: 'Fast-track your career with continuous learning and development programs.' },
  { icon: Users, title: 'Inclusive Culture', description: 'A diverse, collaborative workplace where every voice is valued.' },
  { icon: Heart, title: 'Work-Life Balance', description: 'Flexible hours, remote work options, and generous time off.' },
];

const jobs = [
  { title: 'Frontend Developer', department: 'Engineering', location: 'Lahore (Remote)', type: 'Full-time', description: 'Build beautiful, responsive user interfaces for our e-commerce platform using React and TypeScript.' },
  { title: 'Customer Support Specialist', department: 'Support', location: 'Lahore', type: 'Full-time', description: 'Help our customers with inquiries, orders, and provide an exceptional support experience.' },
  { title: 'Marketing Manager', department: 'Marketing', location: 'Lahore (Hybrid)', type: 'Full-time', description: 'Lead digital marketing campaigns, manage social media, and drive brand awareness.' },
  { title: 'Warehouse Associate', department: 'Operations', location: 'Lahore', type: 'Part-time', description: 'Handle inventory management, order fulfillment, and ensure timely dispatch of products.' },
];

function ApplyDialog({ jobTitle }: { jobTitle: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Application Submitted!', description: `Thank you for applying for ${jobTitle}. We'll review and contact you soon.` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">Apply Now <ArrowRight className="h-3.5 w-3.5" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Apply for {jobTitle}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="Your name" required /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@example.com" required /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+92 300 1234567" required /></div>
          <div className="space-y-1.5"><Label>Why should we hire you?</Label><Textarea rows={3} placeholder="Tell us about yourself..." required /></div>
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Careers() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Join Our <span className="text-primary">Team</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Help us build the future of e-commerce in Pakistan. We're looking for passionate people.
          </motion.p>
        </div>
      </section>

      {/* Perks */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {perks.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card border rounded-2xl p-6 text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><p.icon className="h-6 w-6 text-primary" /></div>
              <h3 className="font-display font-semibold text-lg mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Openings */}
      <section className="container pb-16 md:pb-24">
        <h2 className="font-display text-2xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold">{job.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{job.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.type}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{job.department}</span>
                </div>
              </div>
              <ApplyDialog jobTitle={job.title} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
