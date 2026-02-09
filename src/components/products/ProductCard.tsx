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
      toast.success('Added to cart', { description: product.name });
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
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="group overflow-hidden product-card-hover h-full rounded-sm bg-card">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
            />

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground rounded-sm font-mono text-[10px]">
                  -{discount}%
                </Badge>
              )}
              {product.best_seller && (
                <Badge className="bg-accent text-accent-foreground border-0 rounded-sm font-mono text-[10px]">
                  HOT
                </Badge>
              )}
              {product.featured && !product.best_seller && (
                <Badge className="bg-primary text-primary-foreground border-0 rounded-sm font-mono text-[10px]">
                  FEAT
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="rounded-sm font-mono text-[10px]">
                  OOS
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-sm shadow-lg"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-sm shadow-lg"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Add to cart */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform group-hover:translate-y-0">
              <Button
                className="w-full rounded-none gradient-primary border-0 font-mono text-xs tracking-wider h-9"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                {product.stock === 0 ? 'OUT_OF_STOCK' : 'ADD_TO_CART'}
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-3">
            {product.category && (
              <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
                {product.category.name}
              </p>
            )}

            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                ({product.review_count})
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-base font-bold text-primary font-mono">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-muted-foreground line-through font-mono">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>

            {product.stock > 0 && product.stock <= 10 && (
              <p className="mt-1 font-mono text-[10px] text-destructive">
                ⚠ {product.stock} units remaining
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
