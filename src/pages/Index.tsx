import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, CreditCard, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import { categories, getFeaturedProducts, getBestSellers } from "@/data/products";

const Index = () => {
  const featuredProducts = getFeaturedProducts();
  const bestSellers = getBestSellers();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
              🔥 Mega Sale - Up to 50% Off
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Shop the Best Deals in Pakistan
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Discover premium products at unbeatable prices. Free shipping on orders over PKR 5,000.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-accent text-white">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-header">
                <Link to="/products?deal=true">View Deals</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-b">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over PKR 5,000" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: CreditCard, title: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <feature.icon className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/products?category=${cat.slug}`} className="category-card block text-center">
                  <img src={cat.image} alt={cat.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                  <h3 className="font-medium text-sm">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-medium">
              View All <ArrowRight className="inline w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Best Sellers</h2>
            <Link to="/products" className="text-primary hover:underline text-sm font-medium">
              View All <ArrowRight className="inline w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-header text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Join MyStore Today</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Sign up and get 10% off your first order. Don't miss exclusive deals!
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-accent">
            <Link to="/auth">Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
