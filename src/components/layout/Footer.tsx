import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/products' },
    { name: 'Featured', href: '/products?featured=true' },
    { name: 'Best Sellers', href: '/products?bestseller=true' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Subscribe to updates
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                // get deals piped to your inbox
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="user@email.dev"
                className="w-full md:w-72 font-mono text-sm bg-secondary border-border rounded-sm"
              />
              <Button className="gradient-primary border-0 font-mono text-xs tracking-wider rounded-sm shrink-0">
                subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="border border-primary/50 rounded-sm p-1.5 bg-primary/10">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <span className="font-mono text-lg font-bold">
                my<span className="text-primary">store</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Your one-stop technical marketplace. Quality products, transparent pricing, zero bloat.
            </p>
            <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" />
                <span>123 Shopping St, Lahore, PK</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" />
                <span>support@mystore.pk</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-mono text-xs font-semibold tracking-widest uppercase text-foreground mb-4">
                ./{key}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              © {new Date().getFullYear()} mystore.pk — all rights reserved — v2.6.0
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span>accepts:</span>
              {['VISA', 'MC', 'JazzCash', 'EP'].map((m) => (
                <span key={m} className="border border-border px-1.5 py-0.5 rounded-sm bg-secondary">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
