import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/products";

const Footer = () => {
  return (
    <footer className="bg-header text-white mt-auto">
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-3 bg-header-secondary hover:bg-header-secondary/80 text-sm font-medium transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Get to Know Us */}
          <div>
            <h3 className="font-semibold mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/about" className="hover:text-primary hover:underline">
                  About MyStore
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-primary hover:underline">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop with Us */}
          <div>
            <h3 className="font-semibold mb-4">Shop with Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="hover:text-primary hover:underline"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="hover:text-primary hover:underline">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="font-semibold mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/account" className="hover:text-primary hover:underline">
                  Your Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary hover:underline">
                  Your Orders
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-primary hover:underline">
                  Shipping Rates
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary hover:underline">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-primary hover:underline">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-300 mb-3">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="bg-primary hover:bg-accent shrink-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>+92 300 1234567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>support@mystore.pk</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Lahore, Pakistan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-header-secondary">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">My</span>
              <span className="text-lg font-bold text-primary">Store</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-white">
                Cookie Policy
              </Link>
            </div>
            <p>© 2024 MyStore. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
