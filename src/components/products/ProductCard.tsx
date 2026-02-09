import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/formatters';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const discount = product.original_price 
    ? calculateDiscount(product.original_price, product.price) 
    : 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product);
      toast.success('Added to cart!', {
        description: product.name,
      });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="group overflow-hidden product-card-hover h-full">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  -{discount}%
                </Badge>
              )}
              {product.best_seller && (
                <Badge className="gradient-accent text-accent-foreground border-0">
                  Best Seller
                </Badge>
              )}
              {product.featured && !product.best_seller && (
                <Badge className="gradient-primary text-primary-foreground border-0">
                  Featured
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-lg"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform group-hover:translate-y-0">
              <Button
                className="w-full rounded-none gradient-primary border-0"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-muted-foreground mb-1">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="mt-1 text-xs text-destructive">
                Only {product.stock} left in stock!
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
