import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice, calculateDiscount } from '@/lib/formatters';
import { toast } from 'sonner';

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: typeof items[0]) => {
    if (product.stock > 0) {
      addItem(product);
      toast.success('Added to cart!', { description: product.name });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Heart className="h-24 w-24 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save items you love for later by clicking the heart icon
          </p>
          <Link to="/products">
            <Button className="gradient-primary border-0">
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            My Wishlist ({items.length} items)
          </h1>
          <Button variant="outline" onClick={clearWishlist}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-xl border overflow-hidden"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.original_price && product.original_price > product.price && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                        -{calculateDiscount(product.original_price, product.price)}%
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-primary mt-2">
                  {formatPrice(product.price)}
                </p>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary border-0"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
