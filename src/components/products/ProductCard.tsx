import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Product } from "@/types";

import {
  formatPrice,
  calculateDiscount,
} from "@/lib/formatters";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const { addItem } = useCartStore();

  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  /*
   * --------------------------------------------------------------------------
   * PRODUCT DATA
   * --------------------------------------------------------------------------
   */

  const discount =
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? calculateDiscount(
          product.compareAtPrice,
          product.price,
        )
      : 0;

  const isWishlisted = isInWishlist(product._id);

  const isOutOfStock = product.stock <= 0;

  /*
   * --------------------------------------------------------------------------
   * CART
   * --------------------------------------------------------------------------
   */

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    addItem(product);

    toast.success("Added to cart!", {
      description: product.name,
    });
  };

  /*
   * --------------------------------------------------------------------------
   * WISHLIST
   * --------------------------------------------------------------------------
   */

  const handleToggleWishlist = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(product._id);

      toast.success("Removed from wishlist");
      return;
    }

    addToWishlist(product);

    toast.success("Added to wishlist!");
  };

  /*
   * --------------------------------------------------------------------------
   * UI
   * --------------------------------------------------------------------------
   */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link to={`/product/${product._id}`}>
        <Card className="group overflow-hidden product-card-hover h-full border-border/50 bg-card">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              loading={index < 5 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(event) => {
                event.currentTarget.src =
                  "/placeholder.svg";
              }}
            />

            {/* Badges */}
            <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground rounded-lg px-2 py-0.5 text-xs font-bold">
                  -{discount}%
                </Badge>
              )}

              {product.bestSeller && (
                <Badge className="gradient-accent text-accent-foreground border-0 rounded-lg px-2 py-0.5 text-xs font-bold">
                  Best Seller
                </Badge>
              )}

              {product.featured &&
                !product.bestSeller && (
                  <Badge className="gradient-primary text-primary-foreground border-0 rounded-lg px-2 py-0.5 text-xs font-bold">
                    Featured
                  </Badge>
                )}

              {isOutOfStock && (
                <Badge
                  variant="secondary"
                  className="rounded-lg"
                >
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute right-2.5 top-2.5 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background"
                onClick={handleToggleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isWishlisted
                      ? "fill-destructive text-destructive"
                      : ""
                  }`}
                />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background"
                aria-label="View product"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
              <Button
                type="button"
                className="w-full rounded-none gradient-primary border-0 h-11 font-semibold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />

                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            {/* Category */}
            {product.category && (
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-3.5 w-3.5 ${
                      starIndex <
                      Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] text-muted-foreground font-medium">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>

              {product.compareAtPrice &&
                product.compareAtPrice >
                  product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(
                      product.compareAtPrice,
                    )}
                  </span>
                )}
            </div>

            {/* Stock */}
            {product.stock > 0 &&
              product.stock <= 10 && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-destructive transition-all"
                      style={{
                        width: `${Math.min(
                          (product.stock / 10) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-[11px] text-destructive font-semibold whitespace-nowrap">
                    {product.stock} left
                  </span>
                </div>
              )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}