import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Minus,
  Plus,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { useProduct, useProducts } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductQA } from "@/components/products/ProductQA";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { formatPrice, calculateDiscount } from "@/lib/formatters";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import { SEO } from "@/components/SEO";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useProduct(id ?? "");

  const {
    data: allProducts = [],
    isError: isProductsError,
  } = useProducts();

  const { addItem } = useCartStore();

  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  const addRecentlyViewed = useRecentlyViewedStore(
    (state) => state.add,
  );

  const images = product?.images ?? [];

  useEffect(() => {
    if (!product) return;

    setSelectedImage(0);
    setQuantity(1);
    addRecentlyViewed(product);
  }, [product?._id, addRecentlyViewed]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const candidates = allProducts.filter(
      (item) =>
        item._id !== product._id &&
        item.isActive &&
        item.stock > 0,
    );

    const sameCategory = candidates.filter(
      (item) =>
        Boolean(product.category?._id) &&
        item.category?._id === product.category._id,
    );

    const priceBand = candidates.filter(
      (item) =>
        item.price >= product.price * 0.6 &&
        item.price <= product.price * 1.6,
    );

    const combined = [...sameCategory];

    for (const item of priceBand) {
      if (!combined.some((existing) => existing._id === item._id)) {
        combined.push(item);
      }
    }

    return combined
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [allProducts, product]);

  if (isProductLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-xl" />

          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">
          Unable to load product
        </h1>

        <p className="mt-2 text-muted-foreground">
          Please check your connection and try again.
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={() => refetchProduct()}>
            Try Again
          </Button>

          <Button variant="outline" asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">
          Product not found
        </h1>

        <Link
          to="/products"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const discount =
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price
      ? calculateDiscount(
          product.compareAtPrice,
          product.price,
        )
      : 0;

  const isWishlisted = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const canAddToCart = !isOutOfStock && quantity <= product.stock;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      toast.error("Requested quantity is not available");
      return;
    }

    addItem(product, quantity);

    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist");
      return;
    }

    addToWishlist(product);
    toast.success("Added to wishlist!");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Unable to copy link. Please copy the URL manually.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={product.name}
        description={
          product.description?.slice(0, 155) ||
          `Buy ${product.name} at MyStore Pakistan.`
        }
        image={images[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: images,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "PKR",
            availability: isOutOfStock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          },
          ...(product.reviewCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                },
              }
            : {}),
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary">
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link to="/products" className="hover:text-primary">
              Products
            </Link>

            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />

                <Link
                  to={`/products?category=${encodeURIComponent(
                    product.category._id,
                  )}`}
                  className="hover:text-primary"
                >
                  {product.category.name}
                </Link>
              </>
            )}

            <ChevronRight className="h-4 w-4" />

            <span className="text-foreground truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <motion.img
                key={`${product._id}-${selectedImage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                    aria-pressed={selectedImage === index}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="secondary">
                  {product.category.name}
                </Badge>
              )}

              {product.bestSeller && (
                <Badge className="gradient-accent text-accent-foreground border-0">
                  Best Seller
                </Badge>
              )}

              {product.featured && (
                <Badge className="gradient-primary text-primary-foreground border-0">
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold">
              {product.name}
            </h1>

            {/* Rating summary from product API */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center"
                aria-label={`Rated ${product.rating} out of 5`}
              >
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <span className="text-sm font-medium">
                {product.rating.toFixed(1)}
              </span>

              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>

              {discount > 0 && product.compareAtPrice != null && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>

                  <Badge variant="destructive" className="text-sm">
                    -{discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <p className="text-destructive flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Out of Stock
                </p>
              ) : (
                <p className="text-success flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  In Stock ({product.stock} available)
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg self-start">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span
                  className="w-12 text-center font-medium"
                  aria-live="polite"
                >
                  {quantity}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(product.stock, current + 1),
                    )
                  }
                  disabled={isOutOfStock || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                type="button"
                size="lg"
                className="flex-1 gradient-primary border-0"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted
                      ? "fill-destructive text-destructive"
                      : ""
                  }`}
                />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleShare}
                aria-label="Copy product link"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Store Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  Free Delivery
                </span>
                <span className="text-xs text-muted-foreground">
                  Over PKR 5,000
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  Secure Payment
                </span>
                <span className="text-xs text-muted-foreground">
                  100% Protected
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <RefreshCw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  Easy Returns
                </span>
                <span className="text-xs text-muted-foreground">
                  7-Day Policy
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews, Q&A & Related Products */}
        <div className="mt-12">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">
                Reviews ({product.reviewCount})
              </TabsTrigger>

              <TabsTrigger value="qa">
                Q&amp;A
              </TabsTrigger>

              <TabsTrigger value="related">
                Related Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-8">
                <div className="flex justify-center items-center gap-2 mb-3">
                  <Star className="h-5 w-5 fill-accent text-accent" />

                  <span className="text-xl font-semibold">
                    {product.rating.toFixed(1)} / 5
                  </span>
                </div>

                <p className="text-muted-foreground">
                  {product.reviewCount > 0
                    ? `Based on ${product.reviewCount} reviews.`
                    : "No reviews yet."}
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  Review submission and review details will be available
                  once the reviews API is connected.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <ProductQA productId={product._id} />
            </TabsContent>

            <TabsContent value="related" className="mt-6">
              {isProductsError ? (
                <p className="text-muted-foreground text-center py-8">
                  Unable to load related products.
                </p>
              ) : relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((relatedProduct, index) => (
                    <ProductCard
                      key={relatedProduct._id}
                      product={relatedProduct}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No related products found.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <RecentlyViewed excludeId={product._id} />
      </div>
    </div>
  );
}
