import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function SharedWishlist() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const [title, setTitle] = useState('Shared Wishlist');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data: share } = await supabase
        .from('shared_wishlists')
        .select('title, product_ids')
        .eq('token', token)
        .maybeSingle();

      if (!share) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTitle(share.title);
      const ids = (share.product_ids as string[]) || [];
      if (ids.length) {
        const { data: prods } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .in('id', ids);
        setProducts((prods as Product[]) || []);
      }
      setLoading(false);
    })();
  }, [token]);

  const addAll = () => {
    products.filter((p) => p.stock > 0).forEach((p) => addItem(p));
    toast.success('Added in-stock items to cart');
  };

  if (loading) {
    return <div className="container py-12 text-center text-muted-foreground">Loading…</div>;
  }
  if (notFound) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Wishlist not found</h1>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO title={`${title} – Shared Wishlist`} description="A wishlist shared from MyStore." />
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="gradient-primary p-3 rounded-2xl shadow-glow">
            <Heart className="h-6 w-6 text-primary-foreground fill-current" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {t('sharedWishlistTitle')}
            </p>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{title}</h1>
          </div>
          {products.length > 0 && (
            <Button onClick={addAll} className="gradient-primary border-0">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('addAllToCart')}
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">This wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
