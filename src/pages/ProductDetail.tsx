import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/products/ProductCard';
import { formatPrice, calculateDiscount } from '@/lib/formatters';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { ReviewForm } from '@/components/products/ReviewForm';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();

      if (data) {
        setProduct(data as Product);
        setSelectedImage(0);
        setQuantity(1);

        // Fetch related products
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', data.category_id)
            .neq('id', id)
            .limit(4);

          if (related) setRelatedProducts(related as Product[]);
        }

        // Fetch reviews
        fetchReviews(id);
      }

      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const fetchReviews = async (productId: string) => {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (reviewsData) setReviews(reviewsData as Review[]);
  };

  if (loading) {
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

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const discount = product.original_price
    ? calculateDiscount(product.original_price, product.price)
    : 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem(product, quantity);
      toast.success('Added to cart!', {
        description: `${quantity}x ${product.name}`,
      });
    }
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={product.name}
        description={product.description?.slice(0, 155) || `Buy ${product.name} at MyStore Pakistan. Best price guaranteed.`}
        image={product.images?.[0]}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'PKR',
            availability: product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
          aggregateRating: product.review_count > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.review_count,
              }
            : undefined,
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-primary">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  to={`/products?category=${encodeURIComponent(product.category.name)}`}
                  className="hover:text-primary"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
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
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
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
            {/* Category & Badges */}
            <div className="flex items-center gap-2">
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              {product.best_seller && (
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

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-display font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge variant="destructive" className="text-sm">
                    -{discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <p className="text-success flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-destructive flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Out of Stock
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="flex-1 gradient-primary border-0"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              {/* Wishlist */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? 'fill-destructive text-destructive' : ''
                  }`}
                />
              </Button>

              {/* Share */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Free Delivery</span>
                <span className="text-xs text-muted-foreground">Over PKR 5,000</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Secure Payment</span>
                <span className="text-xs text-muted-foreground">100% Protected</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <RefreshCw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Easy Returns</span>
                <span className="text-xs text-muted-foreground">7-Day Policy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews & Related Products */}
        <div className="mt-12">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="related">Related Products</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {(review as any).profile?.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {(review as any).profile?.full_name || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-accent text-accent'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
              <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
              <div className="mt-6">
                <ReviewForm productId={product.id} onReviewAdded={() => fetchReviews(product.id)} />
              </div>
            </TabsContent>
            <TabsContent value="related" className="mt-6">
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
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
      </div>
    </div>
  );
}
