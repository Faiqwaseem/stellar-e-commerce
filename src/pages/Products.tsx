import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/products';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/formatters';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const categoryFilter = searchParams.get('category') || '';
  const searchFilter = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = parseInt(searchParams.get('minPrice') || '0');
  const maxPrice = parseInt(searchParams.get('maxPrice') || '1000000');
  const featuredFilter = searchParams.get('featured') === 'true';
  const bestsellerFilter = searchParams.get('bestseller') === 'true';

  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data as Category[]);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' });

      // Apply filters
      if (categoryFilter) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryFilter)
          .single();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }

      if (searchFilter) {
        query = query.ilike('name', `%${searchFilter}%`);
      }

      if (featuredFilter) {
        query = query.eq('featured', true);
      }

      if (bestsellerFilter) {
        query = query.eq('best_seller', true);
      }

      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, count } = await query;

      if (data) {
        setProducts(data as Product[]);
        setTotalCount(count || 0);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [categoryFilter, searchFilter, sortBy, priceRange, featuredFilter, bestsellerFilter]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 1000000]);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <div
            className={`cursor-pointer text-sm py-1 px-2 rounded hover:bg-muted transition-colors ${
              !categoryFilter ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => updateFilter('category', '')}
          >
            All Categories
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              className={`cursor-pointer text-sm py-1 px-2 rounded hover:bg-muted transition-colors ${
                categoryFilter === category.name ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => updateFilter('category', category.name)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000000}
          step={1000}
          className="mb-4"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>{formatPrice(priceRange[0])}</span>
          <span>-</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Other Filters */}
      <div>
        <h3 className="font-semibold mb-3">Product Type</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featuredFilter}
              onCheckedChange={(checked) =>
                updateFilter('featured', checked ? 'true' : '')
              }
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bestseller"
              checked={bestsellerFilter}
              onCheckedChange={(checked) =>
                updateFilter('bestseller', checked ? 'true' : '')
              }
            />
            <Label htmlFor="bestseller" className="text-sm cursor-pointer">
              Best Sellers
            </Label>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={categoryFilter ? `${categoryFilter} Products` : 'All Products'}
        description={categoryFilter ? `Browse ${categoryFilter} products at MyStore Pakistan. Best prices and free delivery.` : 'Browse our full catalog of electronics, fashion, home essentials and more at MyStore Pakistan.'}
      />
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Products</span>
            {categoryFilter && (
              <>
                <span>/</span>
                <span className="text-foreground">{categoryFilter}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-display font-bold">
                  {categoryFilter || 'All Products'}
                </h1>
                <p className="text-muted-foreground">
                  {totalCount} products found
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => updateFilter('sort', v)}>
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search info */}
            {searchFilter && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Showing results for: <strong>"{searchFilter}"</strong>
                </p>
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid products={products} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
}
